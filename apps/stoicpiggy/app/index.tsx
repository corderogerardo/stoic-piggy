import { useChildHome } from '@stoicpiggy/api';
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

  const [screen, setScreen] = useState('home');
  const [chat, setChat] = useState<ChatMsg[]>([]);

  const isApp = ['home', 'tasks', 'coach', 'quests', 'wins'].includes(screen);

  const send = (text: string) => {
    if (!text.trim()) return;
    const uc = chat.filter((m) => m.role === 'me').length;
    const i = uc % REPLIES.es.length;
    setChat([
      ...chat,
      { role: 'me', es: text, en: text },
      { role: 'piggy', es: REPLIES.es[i] ?? '', en: REPLIES.en[i] ?? '' },
    ]);
  };
  const messages = [
    { role: 'piggy' as const, text: t.coach.intro },
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
          <Coach messages={messages} suggestions={suggestions} onSend={send} />
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
