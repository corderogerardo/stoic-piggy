import { useChildTasks, useSubmitTask, useTRPC } from '@stoicpiggy/api';
import { centsToDollars, type Task } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Pressable, ScrollView, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

type Stage = 'todo' | 'pending' | 'done';

// active/rejected → the kid can (re)submit; submitted → waiting on the parent; approved → done.
const stageOf = (status: Task['status']): Stage =>
  status === 'submitted' ? 'pending' : status === 'approved' ? 'done' : 'todo';
const ORDER: Record<Stage, number> = { todo: 0, pending: 1, done: 2 };
const CAT_ICON: Record<Task['category'], string> = { chore: 'check', lesson: 'graduation-cap' };

const rewardOf = (k: Task): string => {
  const money = `+$${Math.round(centsToDollars(k.amountCents))}`;
  const xp = `+${k.rewardXp} XP`;
  if (k.payType === 'xp') return xp;
  if (k.payType === 'both') return `${money} · ${xp}`;
  return money;
};

/** The signed-in kid's real tasks. Marking one done submits it for the parent to approve. */
export function Tasks() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const { child } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const childId = child?.id ?? '';
  const tasksQ = useChildTasks(childId);
  const submit = useSubmitTask();

  const tasks = tasksQ.data ?? [];
  const weeklyEarn = tasks
    .filter((k) => k.payType !== 'xp' && stageOf(k.status) === 'todo')
    .reduce((sum, k) => sum + Math.round(centsToDollars(k.amountCents)), 0);
  const sorted = [...tasks].sort((a, b) => ORDER[stageOf(a.status)] - ORDER[stageOf(b.status)]);

  const onMark = async (taskId: string) => {
    await submit.mutateAsync({ taskId });
    await queryClient.invalidateQueries({ queryKey: trpc.tasks.listByChild.queryKey({ childId }) });
  };

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

      {tasksQ.isPending ? (
        <Txt w="400" style={{ fontSize: 13.5, color: colors.ink3 }}>
          {lang === 'es' ? 'Cargando…' : 'Loading…'}
        </Txt>
      ) : tasks.length === 0 ? (
        <Txt w="400" style={{ fontSize: 13.5, color: colors.ink3 }}>
          {lang === 'es'
            ? 'No tienes tareas todavía. ¡Mamá o papá te asignarán algunas!'
            : 'No tasks yet. A parent will assign you some!'}
        </Txt>
      ) : (
        <View style={{ gap: 11 }}>
          {sorted.map((k) => {
            const st = stageOf(k.status);
            const isXp = k.payType === 'xp';
            const reward = rewardOf(k);
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
                  <Icon
                    name={CAT_ICON[k.category]}
                    size={18}
                    color={done ? colors.ink3 : colors.accent}
                  />
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
                    {k.title}
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
                  style={{
                    fontSize: 15,
                    color: done ? colors.ink3 : isXp ? '#457B9D' : colors.ink,
                  }}
                >
                  {reward}
                </Txt>
                <Pressable
                  disabled={st !== 'todo' || submit.isPending}
                  onPress={() => onMark(k.id)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      st === 'todo'
                        ? 'transparent'
                        : st === 'pending'
                          ? colors.soft
                          : colors.accent,
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
      )}
    </ScrollView>
  );
}
