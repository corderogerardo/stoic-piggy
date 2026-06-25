import { useChildHome, useMyPatterns } from '@stoicpiggy/api';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Piggy } from '@/components/Piggy';
import { Coach } from '@/components/screens/Coach';
import { Home } from '@/components/screens/Home';
import { Login } from '@/components/screens/Login';
import { Onboarding } from '@/components/screens/Onboarding';
import { Quests } from '@/components/screens/Quests';
import { Tasks } from '@/components/screens/Tasks';
import { Temptation } from '@/components/screens/Temptation';
import { Wins } from '@/components/screens/Wins';
import { TabBar } from '@/components/TabBar';
import { Txt } from '@/components/Txt';
import { useAuth } from '@/lib/auth';
import { coachReport } from '@/lib/coach';
import { useCoachLLM } from '@/lib/coach-llm';
import { type AppStrings, REPLIES } from '@/lib/content';
import { loadOnboardingSeen, setOnboardingSeen } from '@/lib/first-run';
import { useLang, useTheme } from '@/lib/providers';
import type { ThemeColors } from '@/lib/theme';

type ChatMsg = { role: 'me' | 'piggy'; es: string; en: string };

/** Route entry: one-time intro → sign-in → the kid app. */
export default function Index() {
  const { colors } = useTheme();
  const { status } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    loadOnboardingSeen().then(setOnboarded);
  }, []);

  // Wait for both auth hydration and the onboarding flag before deciding.
  if (status === 'loading' || onboarded === null) {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }

  if (status !== 'authenticated') {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
        {onboarded ? (
          <Login />
        ) : (
          <Onboarding
            onStart={() => {
              void setOnboardingSeen();
              setOnboarded(true);
            }}
          />
        )}
      </SafeAreaView>
    );
  }

  return <KidApp />;
}

/** Full-screen "waking up the backend" state (Render free tier cold start). */
function Splash({ label, colors }: { label: string; colors: ThemeColors }) {
  return (
    <SafeAreaView
      edges={['top']}
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
      }}
    >
      <Piggy mood="zen" size={104} />
      <ActivityIndicator color={colors.accent} />
      <Txt w="600" style={{ fontSize: 14, color: colors.ink2 }}>
        {label}
      </Txt>
    </SafeAreaView>
  );
}

/** Shown when the first home load fails (no cached data) — honest, with a retry. */
function ConnError({
  t,
  colors,
  busy,
  onRetry,
}: {
  t: AppStrings;
  colors: ThemeColors;
  busy: boolean;
  onRetry: () => void;
}) {
  return (
    <SafeAreaView
      edges={['top']}
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
        gap: 14,
      }}
    >
      <Piggy mood="thinking" size={104} />
      <Txt w="800" style={{ fontSize: 20, color: colors.ink }}>
        {t.conn.errTitle}
      </Txt>
      <Txt
        w="400"
        style={{ fontSize: 14, lineHeight: 21, textAlign: 'center', color: colors.ink2 }}
      >
        {t.conn.errBody}
      </Txt>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        disabled={busy}
        style={{
          backgroundColor: colors.accent,
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 14,
          marginTop: 6,
          opacity: busy ? 0.6 : 1,
        }}
      >
        <Txt w="800" style={{ fontSize: 15, color: colors.accentInk }}>
          {busy ? t.conn.waking : t.conn.retry}
        </Txt>
      </Pressable>
    </SafeAreaView>
  );
}

function KidApp() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const { logout } = useAuth();
  const home = useChildHome();
  const patterns = useMyPatterns();

  const [screen, setScreen] = useState('home');
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [aiOn, setAiOn] = useState(false);
  const coach = useCoachLLM(aiOn, patterns.data, lang);

  // Gate the app on the first home load — never render placeholder numbers.
  // Once data exists, keep showing it (a later background refetch error won't
  // blow the UI away).
  if (!home.data) {
    return home.isError ? (
      <ConnError t={t} colors={colors} busy={home.isFetching} onRetry={() => void home.refetch()} />
    ) : (
      <Splash label={t.conn.waking} colors={colors} />
    );
  }

  const { child: kid, balanceCents, goal, quests } = home.data;
  const currentQuest =
    quests.find((q) => q.status === 'in_progress') ?? quests.find((q) => q.status === 'available');

  const isApp = ['home', 'tasks', 'coach', 'quests', 'wins'].includes(screen);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const mine = chat.filter((m) => m.role === 'me').length;
    setChat((c) => [...c, { role: 'me', es: text, en: text }]);
    // Tier 2: try the on-device LLM. Returns null if it's off, still downloading,
    // or unavailable — then we fall back to the Tier 1 canned reply.
    const aiReply = await coach.ask(text);
    const reply = aiReply
      ? { role: 'piggy' as const, es: aiReply, en: aiReply }
      : {
          role: 'piggy' as const,
          es: REPLIES.es[mine % REPLIES.es.length] ?? '',
          en: REPLIES.en[mine % REPLIES.en.length] ?? '',
        };
    setChat((c) => [...c, reply]);
  };
  const messages = [
    // Tier 1: opening line built from the kid's real numbers (works offline).
    { role: 'piggy' as const, text: coachReport(patterns.data, lang) },
    ...chat.map((m) => ({ role: m.role, text: lang === 'es' ? m.es : m.en })),
  ];
  const suggestions = [t.coach.s1, t.coach.s2, t.coach.s3];

  const takeChallenge = () => setScreen('temptation');

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1 }}>
        {screen === 'home' && (
          <Home
            go={setScreen}
            onChallenge={takeChallenge}
            onLogout={logout}
            kidName={kid.displayName}
            balanceCents={balanceCents}
            level={kid.level}
            xp={kid.xp}
            goal={goal}
            quest={
              currentQuest
                ? { title: currentQuest.title, description: currentQuest.description }
                : undefined
            }
          />
        )}
        {screen === 'coach' && (
          <Coach
            messages={messages}
            suggestions={suggestions}
            onSend={send}
            ai={{
              available: coach.available,
              on: aiOn,
              onToggle: () => setAiOn((v) => !v),
              ready: coach.ready,
              downloadProgress: coach.downloadProgress,
            }}
          />
        )}
        {screen === 'quests' && <Quests />}
        {screen === 'tasks' && <Tasks />}
        {screen === 'wins' && <Wins />}
        {screen === 'temptation' && <Temptation onHome={() => setScreen('home')} />}
      </View>
      {isApp && <TabBar screen={screen} onTab={setScreen} />}
    </SafeAreaView>
  );
}
