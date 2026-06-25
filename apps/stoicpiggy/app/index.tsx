import { useChildHome, useMyPatterns } from '@stoicpiggy/api';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coach } from '@/components/screens/Coach';
import { Home } from '@/components/screens/Home';
import { Login } from '@/components/screens/Login';
import { Onboarding } from '@/components/screens/Onboarding';
import { Quests } from '@/components/screens/Quests';
import { Tasks } from '@/components/screens/Tasks';
import { Temptation } from '@/components/screens/Temptation';
import { Wins } from '@/components/screens/Wins';
import { TabBar } from '@/components/TabBar';
import { useAuth } from '@/lib/auth';
import { coachReport } from '@/lib/coach';
import { useCoachLLM } from '@/lib/coach-llm';
import { REPLIES } from '@/lib/content';
import { useLang, useTheme } from '@/lib/providers';

type ChatMsg = { role: 'me' | 'piggy'; es: string; en: string };

/** Route entry: gate the kid app behind sign-in. */
export default function Index() {
  const { colors } = useTheme();
  const { status } = useAuth();

  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  }
  if (status !== 'authenticated') {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
        <Login />
      </SafeAreaView>
    );
  }
  return <KidApp />;
}

function KidApp() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const { child, logout } = useAuth();
  const home = useChildHome();
  const patterns = useMyPatterns();

  const [screen, setScreen] = useState('home');
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [aiOn, setAiOn] = useState(false);
  const coach = useCoachLLM(aiOn, patterns.data, lang);

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
        {screen === 'onboarding' && <Onboarding onStart={() => setScreen('home')} />}
        {screen === 'home' && (
          <Home
            go={setScreen}
            onChallenge={takeChallenge}
            onLogout={logout}
            kidName={home.data?.child.displayName ?? child?.displayName}
            balanceCents={home.data?.balanceCents}
            goal={home.data?.goal}
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
