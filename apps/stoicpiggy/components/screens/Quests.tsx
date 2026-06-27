import { useChildHome, useCompleteQuest, useMyQuests, useTRPC } from '@stoicpiggy/api';
import type { Quest } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { getLesson } from '@/lib/lessons';
import { useLang, useTheme } from '@/lib/providers';
import type { ThemeColors } from '@/lib/theme';
import { Icon } from '../Icon';
import { LessonFlow } from '../LessonFlow';
import { Txt } from '../Txt';

const QUEST_ICON = ['piggy-bank', 'bullseye', 'snowflake-o', 'star', 'book', 'trophy'];

/**
 * The signed-in kid's missions. A quest with a `lessonKey` opens a lesson
 * (cards → quiz) and claims its reward only on passing; a claimed lesson
 * re-opens in review mode (no re-reward). Legacy quests still tap-to-claim.
 */
export function Quests() {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const questsQ = useMyQuests();
  const homeQ = useChildHome();
  const complete = useCompleteQuest();
  const allQuests = questsQ.data ?? [];
  const quests = allQuests.filter((q) => q.status !== 'claimed');
  const history = allQuests.filter((q) => q.status === 'claimed');
  const currentXp = homeQ.data?.child.xp ?? 0;
  const [active, setActive] = useState<Quest | null>(null);

  const onComplete = async (id: string) => {
    await complete.mutateAsync({ questId: id });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.me.quests.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.me.home.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.me.wins.queryKey() }),
    ]);
  };

  const onPress = (q: Quest) => {
    const done = q.status === 'claimed';
    if (getLesson(q.lessonKey, lang))
      setActive(q); // open lesson (review if done)
    else if (!done) void onComplete(q.id); // legacy tap-to-claim
  };

  const activeLesson = active ? getLesson(active.lessonKey, lang) : null;

  return (
    <>
      <ScrollView
        testID="quests-screen"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24 }}
      >
        <Txt w="800" style={{ fontSize: 27, color: colors.ink, marginTop: 6 }}>
          {t.lessons.title}
        </Txt>
        <Txt w="400" style={{ fontSize: 13.5, color: colors.ink2, marginBottom: 20 }}>
          {t.lessons.sub}
        </Txt>

        {questsQ.isPending && (
          <Txt w="400" style={{ fontSize: 13.5, color: colors.ink3 }}>
            {lang === 'es' ? 'Cargando…' : 'Loading…'}
          </Txt>
        )}
        {!questsQ.isPending && quests.length === 0 && history.length === 0 && (
          <Txt w="400" style={{ fontSize: 13.5, color: colors.ink3 }}>
            {lang === 'es' ? 'No tienes misiones todavía.' : 'No quests yet.'}
          </Txt>
        )}

        <View style={{ gap: 13 }}>
          {quests.map((q, i) => (
            <QuestCard
              key={q.id}
              q={q}
              icon={QUEST_ICON[i % QUEST_ICON.length] ?? 'star'}
              label={t.lessons.toDo}
              disabled={complete.isPending}
              onPress={() => onPress(q)}
              colors={colors}
            />
          ))}
        </View>

        {history.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <Txt
              w="800"
              style={{ fontSize: 11, letterSpacing: 0.7, color: colors.ink3, marginBottom: 12 }}
            >
              {t.lessons.historyTitle.toUpperCase()}
            </Txt>
            <View style={{ gap: 10 }}>
              {history.map((q) => (
                <QuestCard
                  key={q.id}
                  q={q}
                  icon="check"
                  label={t.lessons.done}
                  done
                  disabled={complete.isPending}
                  onPress={() => onPress(q)}
                  colors={colors}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      {active && activeLesson && (
        <LessonFlow
          lesson={activeLesson}
          title={active.title}
          rewardXp={active.rewardXp}
          currentXp={currentXp}
          reviewMode={active.status === 'claimed'}
          onClaim={() => onComplete(active.id)}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}

function QuestCard({
  q,
  icon,
  label,
  done = false,
  disabled,
  onPress,
  colors,
}: {
  q: Quest;
  icon: string;
  label: string;
  done?: boolean;
  disabled: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorderColor,
        borderWidth: colors.cardBorderWidth,
        borderRadius: 20,
        padding: done ? 14 : 18,
        opacity: done ? 0.55 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <View
          style={{
            width: done ? 36 : 46,
            height: done ? 36 : 46,
            borderRadius: 11,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: done ? colors.chip : colors.soft,
          }}
        >
          <Icon name={icon} size={done ? 14 : 19} color={done ? colors.ink3 : colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt w="800" style={{ fontSize: done ? 14 : 16, color: colors.ink }}>
            {q.title}
          </Txt>
          {!done && (
            <Txt w="400" style={{ fontSize: 12.5, color: colors.ink2, marginTop: 2 }}>
              {q.description}
            </Txt>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View
            style={{
              backgroundColor: done ? colors.chip : colors.soft,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 9999,
            }}
          >
            <Txt w="800" style={{ fontSize: 9, letterSpacing: 0.4, color: colors.ink3 }}>
              {label}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="bolt" size={11} color={colors.ink3} />
            <Txt w="800" style={{ fontSize: 11, color: colors.ink3 }}>
              {q.rewardXp} XP
            </Txt>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
