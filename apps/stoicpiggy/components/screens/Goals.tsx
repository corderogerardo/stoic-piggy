import {
  useChildHome,
  useContributeGoal,
  useCreateGoal,
  useDeleteGoal,
  useMyWins,
  useSavingsGoals,
  useTRPC,
} from '@stoicpiggy/api';
import {
  type ChildWins,
  centsToDollars,
  formatMoney,
  type GoalCategory,
  type GoalTerm,
  type SavingsGoal,
} from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { CATEGORY_ICON, type GoalSuggestion, suggestionsForAge, TERM_MONTHS } from '@/lib/goals';
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

/** Quick-add amounts (cents) for the tracker chips: $1 / $5 / $10. */
const QUICK_ADD = [100, 500, 1000];

export function Goals() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const home = useChildHome();
  const childId = home.data?.child.id ?? '';
  const age = home.data?.child.age;
  const goalsQ = useSavingsGoals(childId);
  const winsQ = useMyWins();
  const w = winsQ.data ?? ZERO;

  const createGoal = useCreateGoal();
  const deleteGoal = useDeleteGoal();
  const contribute = useContributeGoal();

  const [sheetOpen, setSheetOpen] = useState(false);

  const goals = goalsQ.data ?? [];
  const atMax = goals.length >= 3;

  const refetchGoals = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.goals.listByChild.queryKey({ childId }) }),
      queryClient.invalidateQueries({ queryKey: trpc.me.home.queryKey() }),
    ]);

  const onCreate = async (input: {
    title: string;
    targetCents: number;
    term: GoalTerm;
    category: GoalCategory;
  }) => {
    await createGoal.mutateAsync(input);
    await refetchGoals();
    setSheetOpen(false);
  };

  const onContribute = async (goalId: string, amountCents: number) => {
    await contribute.mutateAsync({ goalId, amountCents });
    await refetchGoals();
  };

  const onDelete = (goal: SavingsGoal) => {
    Alert.alert(goal.title, t.goals.deleteConfirm, [
      { text: t.goals.cancel, style: 'cancel' },
      {
        text: t.goals.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteGoal.mutateAsync({ goalId: goal.id });
          await refetchGoals();
        },
      },
    ]);
  };

  const stats = [
    { v: String(w.tasksApproved), l: lang === 'es' ? 'TAREAS' : 'TASKS', accent: false },
    { v: String(w.level), l: lang === 'es' ? 'NIVEL' : 'LEVEL', accent: false },
    { v: String(w.resistedCount), l: lang === 'es' ? 'RESISTIDOS' : 'RESISTED', accent: true },
  ];

  return (
    <>
      <ScrollView
        testID="goals-screen"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24 }}
      >
        <Txt w="800" style={{ fontSize: 27, color: colors.ink, marginTop: 6 }}>
          {t.goals.title}
        </Txt>
        <Txt w="400" style={{ fontSize: 13.5, color: colors.ink2, marginBottom: 18 }}>
          {t.goals.sub}
        </Txt>

        {/* ---- MY GOALS ---- */}
        <SectionLabel text={t.goals.mySection} colors={colors} />

        <View style={{ gap: 12, marginBottom: 10 }}>
          {goals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              colors={colors}
              t={t}
              busy={contribute.isPending || deleteGoal.isPending}
              onAdd={(amt) => onContribute(g.id, amt)}
              onDelete={() => onDelete(g)}
            />
          ))}

          {!goalsQ.isPending && goals.length === 0 && (
            <Txt w="400" style={{ fontSize: 13.5, color: colors.ink3, marginBottom: 4 }}>
              {t.goals.empty}
            </Txt>
          )}
        </View>

        {!atMax && (
          <Pressable
            testID="goals-add"
            onPress={() => setSheetOpen(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 9,
              borderRadius: 16,
              borderWidth: 2,
              borderStyle: 'dashed',
              borderColor: colors.divider,
              paddingVertical: 15,
              marginBottom: 24,
            }}
          >
            <Icon name="plus" size={14} color={colors.accent} />
            <Txt w="800" style={{ fontSize: 14, color: colors.accent }}>
              {t.goals.add}
            </Txt>
          </Pressable>
        )}
        {atMax && (
          <Txt
            w="600"
            style={{ fontSize: 12, color: colors.ink3, textAlign: 'center', marginBottom: 24 }}
          >
            {t.goals.max}
          </Txt>
        )}

        {/* ---- LOGROS (achievements) ---- */}
        <SectionLabel text={t.goals.logrosSection} colors={colors} />

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
              <Txt
                mono
                style={{ fontSize: 26, color: s.accent ? colors.accentInk : colors.darkInk }}
              >
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

      {sheetOpen && (
        <AddGoalSheet
          age={age}
          busy={createGoal.isPending}
          onPick={onCreate}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
}

function SectionLabel({
  text,
  colors,
}: {
  text: string;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.7, color: colors.ink3, marginBottom: 12 }}>
      {text}
    </Txt>
  );
}

type Strings = ReturnType<typeof useLang>['t'];
type Colors = ReturnType<typeof useTheme>['colors'];

/** "~1 month" / "~3 months" hint for a term. */
function termMonths(term: GoalTerm, t: Strings) {
  const n = TERM_MONTHS[term];
  return n === 1 ? t.goals.monthOne : t.goals.monthsN.replace('{n}', String(n));
}

function GoalCard({
  goal,
  colors,
  t,
  busy,
  onAdd,
  onDelete,
}: {
  goal: SavingsGoal;
  colors: Colors;
  t: Strings;
  busy: boolean;
  onAdd: (amountCents: number) => void;
  onDelete: () => void;
}) {
  const achieved = !!goal.achievedAt || goal.savedCents >= goal.targetCents;
  const pct =
    goal.targetCents > 0
      ? Math.min(100, Math.round((goal.savedCents / goal.targetCents) * 100))
      : 0;

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorderColor,
        borderWidth: colors.cardBorderWidth,
        borderRadius: 20,
        padding: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 13,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: achieved ? colors.accent : colors.soft,
          }}
        >
          <Icon
            name={CATEGORY_ICON[goal.category]}
            size={19}
            color={achieved ? colors.accentInk : colors.accent}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Txt w="800" style={{ fontSize: 16, color: colors.ink }}>
            {goal.title}
          </Txt>
          <Txt w="600" style={{ fontSize: 11, color: colors.ink3, marginTop: 2 }}>
            {t.goals.term[goal.term]} · {termMonths(goal.term, t)}
          </Txt>
        </View>
        <Pressable onPress={onDelete} hitSlop={10} accessibilityLabel={t.goals.delete}>
          <Icon name="trash-o" size={16} color={colors.ink3} />
        </Pressable>
      </View>

      {/* progress */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 14,
          marginBottom: 6,
        }}
      >
        <Txt w="600" style={{ fontSize: 12, color: colors.ink2 }}>
          {t.goals.saved} {formatMoney(goal.savedCents)} {t.goals.of}{' '}
          {formatMoney(goal.targetCents)}
        </Txt>
        <Txt w="800" style={{ fontSize: 12, color: achieved ? colors.accent : colors.ink3 }}>
          {pct}%
        </Txt>
      </View>
      <View
        style={{ height: 9, borderRadius: 9999, backgroundColor: colors.chip, overflow: 'hidden' }}
      >
        <View
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: colors.accent,
            borderRadius: 9999,
          }}
        />
      </View>

      {achieved ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            alignSelf: 'flex-start',
            backgroundColor: colors.accent,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 9999,
            marginTop: 14,
          }}
        >
          <Icon name="trophy" size={12} color={colors.accentInk} />
          <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.4, color: colors.accentInk }}>
            {t.goals.achieved}
          </Txt>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {QUICK_ADD.map((amt) => (
            <Pressable
              key={amt}
              disabled={busy}
              onPress={() => onAdd(amt)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: colors.soft,
                opacity: busy ? 0.5 : 1,
              }}
            >
              <Txt w="800" style={{ fontSize: 13, color: colors.accent }}>
                +${Math.round(centsToDollars(amt))}
              </Txt>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function AddGoalSheet({
  age,
  busy,
  onPick,
  onClose,
}: {
  age?: number;
  busy: boolean;
  onPick: (input: {
    title: string;
    targetCents: number;
    term: GoalTerm;
    category: GoalCategory;
  }) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const suggestions = suggestionsForAge(age);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View
          testID="goals-sheet"
          style={{
            backgroundColor: colors.canvas,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            paddingHorizontal: 22,
            paddingTop: 18,
            paddingBottom: 32,
            maxHeight: '88%',
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Txt w="800" style={{ fontSize: 19, color: colors.ink }}>
              {t.goals.sheetTitle}
            </Txt>
            <Pressable
              testID="goals-sheet-close"
              onPress={onClose}
              hitSlop={10}
              accessibilityLabel={t.goals.cancel}
            >
              <Icon name="times" size={18} color={colors.ink3} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ marginTop: 16 }}
            contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          >
            <Pressable
              testID="goals-custom-btn"
              onPress={() => {
                onClose();
                router.push('/goal-new');
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                backgroundColor: colors.soft,
                borderRadius: 16,
                padding: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.accent,
                }}
              >
                <Icon name="pencil" size={17} color={colors.accentInk} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt w="800" style={{ fontSize: 14.5, color: colors.ink }}>
                  {t.goals.tabCustom}
                </Txt>
                <Txt w="400" style={{ fontSize: 11.5, color: colors.ink2, marginTop: 2 }}>
                  {t.goals.customSub}
                </Txt>
              </View>
              <Icon name="arrow-right" size={14} color={colors.accent} />
            </Pressable>

            {suggestions.map((s) => (
              <SuggestionRow
                key={s.key}
                s={s}
                lang={lang}
                t={t}
                colors={colors}
                busy={busy}
                onPick={() =>
                  onPick({
                    title: s[lang].title,
                    targetCents: s.targetCents,
                    term: s.term,
                    category: s.category,
                  })
                }
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SuggestionRow({
  s,
  lang,
  t,
  colors,
  busy,
  onPick,
}: {
  s: GoalSuggestion;
  lang: 'es' | 'en';
  t: Strings;
  colors: Colors;
  busy: boolean;
  onPick: () => void;
}) {
  return (
    <Pressable
      disabled={busy}
      onPress={onPick}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorderColor,
        borderWidth: colors.cardBorderWidth,
        borderRadius: 16,
        padding: 14,
        opacity: busy ? 0.6 : 1,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 13,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.soft,
        }}
      >
        <Icon name={s.icon} size={19} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt w="800" style={{ fontSize: 14.5, color: colors.ink }}>
          {s[lang].title}
        </Txt>
        <Txt w="400" style={{ fontSize: 11.5, lineHeight: 16, color: colors.ink2, marginTop: 2 }}>
          {s[lang].why}
        </Txt>
        <Txt w="800" style={{ fontSize: 10.5, color: colors.ink3, marginTop: 5 }}>
          {formatMoney(s.targetCents)} · {t.goals.term[s.term]}
        </Txt>
      </View>
      <Icon name="plus" size={14} color={colors.accent} />
    </Pressable>
  );
}
