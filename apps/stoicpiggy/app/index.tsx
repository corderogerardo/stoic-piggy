import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coach } from '@/components/screens/Coach';
import { Home } from '@/components/screens/Home';
import { Onboarding } from '@/components/screens/Onboarding';
import { Quests } from '@/components/screens/Quests';
import { Tasks } from '@/components/screens/Tasks';
import { Temptation } from '@/components/screens/Temptation';
import { Wins } from '@/components/screens/Wins';
import { TabBar } from '@/components/TabBar';
import { REPLIES } from '@/lib/content';
import { useLang, useTheme } from '@/lib/providers';

type ChatMsg = { role: 'me' | 'piggy'; es: string; en: string };
type Status = 'todo' | 'pending' | 'done';

export default function AppRoot() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const [screen, setScreen] = useState('onboarding');
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [tStage, setTStage] = useState('intro');
  const [resisted, setResisted] = useState(12);
  const [taskStatus, setTaskStatus] = useState<Record<number, Status>>({
    1: 'todo',
    2: 'done',
    3: 'todo',
    4: 'todo',
    5: 'pending',
  });
  const breatheTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const takeChallenge = () => {
    setTStage('intro');
    setScreen('temptation');
  };
  const breathe = () => {
    setTStage('breathing');
    breatheTimer.current = setTimeout(
      () => setTStage((s) => (s === 'breathing' ? 'decide' : s)),
      2900,
    );
  };
  const goHome = () => {
    setTStage('intro');
    setScreen('home');
  };

  useEffect(
    () => () => {
      if (breatheTimer.current) clearTimeout(breatheTimer.current);
    },
    [],
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.canvas }}>
      <View style={{ flex: 1 }}>
        {screen === 'onboarding' && <Onboarding onStart={() => setScreen('home')} />}
        {screen === 'home' && <Home go={setScreen} onChallenge={takeChallenge} />}
        {screen === 'coach' && (
          <Coach messages={messages} suggestions={suggestions} onSend={send} />
        )}
        {screen === 'quests' && <Quests />}
        {screen === 'tasks' && (
          <Tasks
            taskStatus={taskStatus}
            onMark={(id) => setTaskStatus((s) => ({ ...s, [id]: 'pending' }))}
          />
        )}
        {screen === 'wins' && <Wins resisted={resisted} />}
        {screen === 'temptation' && (
          <Temptation
            stage={tStage}
            resisted={resisted}
            onBreathe={breathe}
            onResist={() => {
              setResisted((r) => r + 1);
              setTStage('resisted');
            }}
            onBuy={() => setTStage('bought')}
            onAgain={() => setTStage('intro')}
            onHome={goHome}
          />
        )}
      </View>
      {isApp && <TabBar screen={screen} onTab={setScreen} />}
    </SafeAreaView>
  );
}
