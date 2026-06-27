import { useChildHome, useMyQuests } from '@stoicpiggy/api';
import type { Quest } from '@stoicpiggy/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { LessonFlow } from '@/components/LessonFlow';
import { Txt } from '@/components/Txt';
import { getLesson } from '@/lib/lessons';
import { useLang, useTheme } from '@/lib/providers';

export default function MissionHistory() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const questsQ = useMyQuests();
  const homeQ = useChildHome();
  const currentXp = homeQ.data?.child.xp ?? 0;
  const [active, setActive] = useState<Quest | null>(null);

  const history = (questsQ.data ?? [])
    .filter((q) => q.status === 'claimed')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const activeLesson = active ? getLesson(active.lessonKey, lang) : null;

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingBottom: insets.bottom }}>
        {/* header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 18,
            paddingTop: insets.top + 10,
            paddingBottom: 14,
          }}
        >
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
            <Icon name="arrow-left" size={20} color={colors.ink} />
          </Pressable>
          <Txt w="800" style={{ fontSize: 20, color: colors.ink, flex: 1 }}>
            {lang === 'es' ? 'Misiones completadas' : 'Completed missions'}
          </Txt>
        </View>

        <FlatList
          data={history}
          keyExtractor={(q) => q.id}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24, gap: 10 }}
          ListEmptyComponent={
            questsQ.isPending ? null : (
              <Txt w="400" style={{ fontSize: 13.5, color: colors.ink3, marginTop: 20 }}>
                {lang === 'es'
                  ? 'Aún no completaste ninguna misión.'
                  : 'No completed missions yet.'}
              </Txt>
            )
          }
          renderItem={({ item: q }) => {
            const hasLesson = !!getLesson(q.lessonKey, lang);
            return (
              <Pressable
                disabled={!hasLesson}
                onPress={() => setActive(q)}
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorderColor,
                  borderWidth: colors.cardBorderWidth,
                  borderRadius: 18,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 13,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.soft,
                  }}
                >
                  <Icon name="check" size={14} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt w="800" style={{ fontSize: 14.5, color: colors.ink }}>
                    {q.title}
                  </Txt>
                  <Txt w="400" style={{ fontSize: 11.5, color: colors.ink3, marginTop: 2 }}>
                    {fmt(q.updatedAt)}
                  </Txt>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Icon name="bolt" size={11} color={colors.accent} />
                    <Txt w="800" style={{ fontSize: 12, color: colors.ink2 }}>
                      {q.rewardXp} XP
                    </Txt>
                  </View>
                  {hasLesson && (
                    <Txt w="400" style={{ fontSize: 10, color: colors.ink3 }}>
                      {lang === 'es' ? 'Repasar →' : 'Review →'}
                    </Txt>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      </View>

      {active && activeLesson && (
        <LessonFlow
          lesson={activeLesson}
          title={active.title}
          rewardXp={active.rewardXp}
          currentXp={currentXp}
          reviewMode
          onClaim={async () => {}}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
