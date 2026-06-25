import { useMyWins } from '@stoicpiggy/api';
import { type ChildWins, centsToDollars } from '@stoicpiggy/shared';
import { ScrollView, View } from 'react-native';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Txt } from '../Txt';

const ZERO: ChildWins = {
  level: 1,
  xp: 0,
  balanceCents: 0,
  resistedCount: 0,
  resistedCents: 0,
  tasksApproved: 0,
};

interface Badge {
  icon: string;
  es: { t: string; d: string };
  en: { t: string; d: string };
  earned: (w: ChildWins) => boolean;
}

const BADGES: Badge[] = [
  {
    icon: 'check',
    es: { t: 'Primera tarea', d: 'Completa tu primera tarea' },
    en: { t: 'First task', d: 'Finish your first task' },
    earned: (w) => w.tasksApproved >= 1,
  },
  {
    icon: 'list-ul',
    es: { t: 'Trabajador', d: 'Completa 5 tareas' },
    en: { t: 'Hard worker', d: 'Finish 5 tasks' },
    earned: (w) => w.tasksApproved >= 5,
  },
  {
    icon: 'bank',
    es: { t: 'Ahorrador', d: 'Ahorra $50' },
    en: { t: 'Saver', d: 'Save $50' },
    earned: (w) => w.balanceCents >= 5000,
  },
  {
    icon: 'snowflake-o',
    es: { t: 'Resistente', d: 'Resiste un impulso' },
    en: { t: 'Cool head', d: 'Resist one impulse' },
    earned: (w) => w.resistedCount >= 1,
  },
  {
    icon: 'shield',
    es: { t: 'Maestro estoico', d: 'Resiste 5 impulsos' },
    en: { t: 'Stoic master', d: 'Resist 5 impulses' },
    earned: (w) => w.resistedCount >= 5,
  },
  {
    icon: 'bolt',
    es: { t: 'Nivel 5', d: 'Llega al nivel 5' },
    en: { t: 'Level 5', d: 'Reach level 5' },
    earned: (w) => w.level >= 5,
  },
];

export function Wins() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const winsQ = useMyWins();
  const w = winsQ.data ?? ZERO;

  const stats = [
    { v: String(w.tasksApproved), l: lang === 'es' ? 'TAREAS' : 'TASKS', accent: false },
    { v: String(w.level), l: lang === 'es' ? 'NIVEL' : 'LEVEL', accent: false },
    { v: String(w.resistedCount), l: lang === 'es' ? 'RESISTIDOS' : 'RESISTED', accent: true },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24 }}
    >
      <Txt w="800" style={{ fontSize: 27, color: colors.ink, marginTop: 6 }}>
        {t.wins.title}
      </Txt>
      <Txt w="400" style={{ fontSize: 13.5, color: colors.ink2, marginBottom: 18 }}>
        {t.wins.sub}
      </Txt>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        {stats.map((s) => (
          <View
            key={s.l}
            style={{
              flex: 1,
              borderRadius: 16,
              padding: 14,
              alignItems: 'center',
              backgroundColor: s.accent ? colors.accent : colors.darkBg,
            }}
          >
            <Txt mono style={{ fontSize: 26, color: s.accent ? colors.accentInk : colors.darkInk }}>
              {s.v}
            </Txt>
            <Txt
              w="800"
              style={{
                fontSize: 9,
                letterSpacing: 0.5,
                marginTop: 3,
                color: s.accent ? colors.accentInk : colors.darkInk2,
              }}
            >
              {s.l}
            </Txt>
          </View>
        ))}
      </View>

      {w.resistedCents > 0 && (
        <View
          style={{ borderRadius: 16, padding: 14, marginBottom: 22, backgroundColor: colors.soft }}
        >
          <Txt w="400" style={{ fontSize: 13, color: colors.ink2 }}>
            {lang === 'es'
              ? `Has decidido NO gastar $${Math.round(centsToDollars(w.resistedCents))} en impulsos. ¡Eso es ahorro real!`
              : `You chose NOT to spend $${Math.round(centsToDollars(w.resistedCents))} on impulses. That's real saving!`}
          </Txt>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {BADGES.map((a) => {
          const earned = a.earned(w);
          const info = a[lang];
          return (
            <View
              key={a.icon}
              style={{
                width: '47%',
                flexGrow: 1,
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorderColor,
                borderWidth: colors.cardBorderWidth,
                borderRadius: 20,
                padding: 16,
                alignItems: 'center',
                opacity: earned ? 1 : 0.5,
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 11,
                  backgroundColor: earned ? colors.accent : colors.chip,
                }}
              >
                <Icon name={a.icon} size={21} color={earned ? colors.accentInk : colors.ink3} />
              </View>
              <Txt w="800" style={{ fontSize: 13.5, textAlign: 'center', color: colors.ink }}>
                {info.t}
              </Txt>
              <Txt
                w="400"
                style={{ fontSize: 11.5, textAlign: 'center', color: colors.ink2, marginTop: 3 }}
              >
                {info.d}
              </Txt>
              <Txt
                w="800"
                style={{
                  fontSize: 8.5,
                  letterSpacing: 0.5,
                  marginTop: 9,
                  color: earned ? colors.accent : colors.ink3,
                }}
              >
                {earned ? t.wins.earned : t.wins.locked}
              </Txt>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
