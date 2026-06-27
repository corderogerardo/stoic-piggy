import { useChildTasks } from '@stoicpiggy/api';
import { centsToDollars } from '@stoicpiggy/shared';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { useAuth } from '@/lib/auth';
import { useLang, useTheme } from '@/lib/providers';

const CAT_ICON: Record<string, string> = { chore: 'check', lesson: 'graduation-cap' };

export default function TaskHistory() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const insets = useSafeAreaInsets();
  const { child } = useAuth();
  const tasksQ = useChildTasks(child?.id ?? '');

  const history = (tasksQ.data ?? [])
    .filter((k) => k.status === 'approved')
    .sort((a, b) => (b.resolvedAt ?? b.updatedAt).localeCompare(a.resolvedAt ?? a.updatedAt));

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const rewardLabel = (k: (typeof history)[number]) => {
    const money = `+$${Math.round(centsToDollars(k.amountCents))}`;
    const xp = `+${k.rewardXp} XP`;
    if (k.payType === 'xp') return xp;
    if (k.payType === 'both') return `${money} · ${xp}`;
    return money;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, paddingBottom: insets.bottom }}>
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
          {lang === 'es' ? 'Tareas completadas' : 'Completed tasks'}
        </Txt>
      </View>

      <FlatList
        data={history}
        keyExtractor={(k) => k.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24, gap: 10 }}
        ListEmptyComponent={
          tasksQ.isPending ? null : (
            <Txt w="400" style={{ fontSize: 13.5, color: colors.ink3, marginTop: 20 }}>
              {lang === 'es' ? 'Aún no completaste ninguna tarea.' : 'No completed tasks yet.'}
            </Txt>
          )
        }
        renderItem={({ item: k }) => (
          <View
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
              <Icon name={CAT_ICON[k.category] ?? 'check'} size={14} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="800" style={{ fontSize: 14.5, color: colors.ink }}>
                {k.title}
              </Txt>
              <Txt w="400" style={{ fontSize: 11.5, color: colors.ink3, marginTop: 2 }}>
                {fmt(k.resolvedAt ?? k.updatedAt)}
              </Txt>
            </View>
            <Txt mono style={{ fontSize: 13, color: colors.ink2 }}>
              {rewardLabel(k)}
            </Txt>
          </View>
        )}
      />
    </View>
  );
}
