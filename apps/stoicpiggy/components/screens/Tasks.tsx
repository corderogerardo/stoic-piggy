import { Pressable, ScrollView, View } from 'react-native';
import { TASKS } from '@/lib/content';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

type Status = 'todo' | 'pending' | 'done';

export function Tasks({
  taskStatus,
  onMark,
}: {
  taskStatus: Record<number, Status>;
  onMark: (id: number) => void;
}) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const order: Record<Status, number> = { todo: 0, pending: 1, done: 2 };
  const statusOf = (id: number): Status => taskStatus[id] ?? 'todo';
  const weeklyEarn = TASKS.filter((k) => k.amt && statusOf(k.id) === 'todo').reduce(
    (sum, k) => sum + (k.amt ?? 0),
    0,
  );
  const sorted = [...TASKS].sort((a, b) => order[statusOf(a.id)] - order[statusOf(b.id)]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24 }}
    >
      <Txt w="800" style={{ fontSize: 27, color: colors.ink, marginTop: 6 }}>
        {t.tasks.title}
      </Txt>
      <Txt w="400" style={{ fontSize: 13.5, color: colors.ink2, marginBottom: 18 }}>
        {t.tasks.sub}
      </Txt>

      <View
        style={{
          backgroundColor: colors.darkBg,
          borderRadius: 20,
          paddingVertical: 18,
          paddingHorizontal: 20,
          marginBottom: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          overflow: 'hidden',
        }}
      >
        <View style={{ flex: 1 }}>
          <Txt
            w="800"
            style={{ fontSize: 10, letterSpacing: 0.6, color: colors.darkInk2, marginBottom: 7 }}
          >
            {t.tasks.earnLabel}
          </Txt>
          <Txt mono style={{ fontSize: 32, letterSpacing: -1.5, color: colors.darkInk }}>
            ${weeklyEarn}
          </Txt>
        </View>
        <Piggy mood="happy" size={58} />
      </View>

      <View style={{ gap: 11 }}>
        {sorted.map((k) => {
          const st = statusOf(k.id);
          const isXp = !!k.xp;
          const reward = isXp ? `+${k.xp} XP` : `+$${k.amt}`;
          const done = st === 'done';
          const meta =
            st === 'todo' ? t.tasks.todo : st === 'pending' ? t.tasks.pending : t.tasks.approved;
          const metaColor =
            st === 'pending' ? colors.accent : st === 'done' ? '#2FAE6B' : colors.ink3;
          return (
            <View
              key={k.id}
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorderColor,
                borderWidth: colors.cardBorderWidth,
                borderRadius: 18,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                opacity: done ? 0.55 : 1,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done
                    ? colors.chip
                    : isXp
                      ? 'rgba(69,123,157,0.16)'
                      : colors.soft,
                }}
              >
                <Icon name={k.icon} size={18} color={done ? colors.ink3 : colors.accent} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt
                  w="800"
                  style={{
                    fontSize: 15,
                    color: colors.ink,
                    textDecorationLine: done ? 'line-through' : 'none',
                  }}
                >
                  {lang === 'es' ? k.es : k.en}
                </Txt>
                <Txt
                  w="800"
                  style={{ fontSize: 10, letterSpacing: 0.4, color: metaColor, marginTop: 4 }}
                >
                  {meta}
                </Txt>
              </View>
              <Txt
                mono
                style={{ fontSize: 15, color: done ? colors.ink3 : isXp ? '#457B9D' : colors.ink }}
              >
                {reward}
              </Txt>
              <Pressable
                disabled={st !== 'todo'}
                onPress={() => onMark(k.id)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    st === 'todo' ? 'transparent' : st === 'pending' ? colors.soft : colors.accent,
                  borderWidth: st === 'todo' ? 2 : 0,
                  borderColor: colors.accent,
                }}
              >
                <Icon
                  name={st === 'pending' ? 'clock-o' : 'check'}
                  size={15}
                  color={st === 'done' ? colors.accentInk : colors.accent}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
