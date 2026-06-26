import { type DashboardGoal, formatMoney, XP_PER_LEVEL } from '@stoicpiggy/shared';
import { Pressable, ScrollView, View } from 'react-native';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

interface HomeProps {
  go: (s: string) => void;
  onChallenge: () => void;
  onLogout?: () => void;
  /** Real signed-in kid data (the parent gate guarantees it's loaded). */
  kidName: string;
  balanceCents: number;
  level: number;
  xp: number;
  goal?: DashboardGoal;
  /** The kid's current (in-progress / next) quest, if any. */
  quest?: { title: string; description: string };
}

export function Home({
  go,
  onChallenge,
  onLogout,
  kidName,
  balanceCents,
  level,
  xp,
  goal,
  quest,
}: HomeProps) {
  const { colors } = useTheme();
  const { t, lang, setLang } = useLang();
  const h = t.home;
  // Named rank for the kid's level (1..7 → Beginner..Expert).
  const tier = t.levels[Math.min(Math.max(level, 1), t.levels.length) - 1] ?? '';

  const goalPct =
    goal && goal.targetCents > 0
      ? Math.min(100, Math.round((goal.savedCents / goal.targetCents) * 100))
      : null;
  // XP earned toward the next level (level boundaries are every XP_PER_LEVEL).
  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPct = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100));
  const progressPct = goalPct ?? xpPct;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 24 }}>
      {/* header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginVertical: 8,
          marginBottom: 20,
        }}
      >
        <View>
          <Txt w="600" style={{ fontSize: 13, color: colors.ink2 }}>
            {h.hi}
          </Txt>
          <Txt w="800" style={{ fontSize: 27, color: colors.ink }}>
            {kidName}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.accent,
              paddingHorizontal: 13,
              paddingVertical: 7,
              borderRadius: 9999,
            }}
          >
            <Icon name="bolt" size={11} color={colors.accentInk} />
            <Txt w="800" style={{ fontSize: 10, letterSpacing: 0.5, color: colors.accentInk }}>
              {h.level} {level} · {tier.toUpperCase()}
            </Txt>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            onPress={() => setLang(lang === 'es' ? 'en' : 'es')}
            hitSlop={8}
            style={{
              height: 34,
              paddingHorizontal: 12,
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.chip,
            }}
          >
            <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.ink3 }}>
              {lang === 'es' ? 'ES' : 'EN'}
            </Txt>
          </Pressable>
          {onLogout && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={onLogout}
              hitSlop={8}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.chip,
              }}
            >
              <Icon name="sign-out" size={14} color={colors.ink3} />
            </Pressable>
          )}
        </View>
      </View>

      {/* balance card */}
      <View
        style={{ backgroundColor: colors.darkBg, borderRadius: 24, padding: 22, marginBottom: 16 }}
      >
        <Txt
          w="800"
          style={{ fontSize: 10, letterSpacing: 0.6, color: colors.darkInk2, marginBottom: 14 }}
        >
          {h.balLabel}
        </Txt>
        <Txt
          mono
          style={{ fontSize: 42, letterSpacing: -1.5, color: colors.darkInk, marginBottom: 18 }}
        >
          {formatMoney(balanceCents)}
        </Txt>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
          <Txt w="800" style={{ fontSize: 10, letterSpacing: 0.5, color: colors.darkInk2 }}>
            {goalPct != null ? goal?.title : h.xp}
          </Txt>
          <Txt w="800" style={{ fontSize: 11, color: colors.darkInk }}>
            {goalPct != null && goal
              ? `${formatMoney(goal.savedCents)} / ${formatMoney(goal.targetCents)}`
              : `${xpInLevel} / ${XP_PER_LEVEL} XP`}
          </Txt>
        </View>
        <View
          style={{
            height: 9,
            borderRadius: 9999,
            backgroundColor: 'rgba(255,255,255,0.16)',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progressPct}%`,
              backgroundColor: '#E63946',
              borderRadius: 9999,
            }}
          />
        </View>
      </View>

      {/* daily challenge */}
      <View
        style={{
          backgroundColor: colors.accent,
          borderRadius: 24,
          padding: 22,
          marginBottom: 16,
          overflow: 'hidden',
        }}
      >
        <View style={{ position: 'absolute', right: -12, top: -6, opacity: 0.92 }}>
          <Piggy mood="tempted" size={104} />
        </View>
        <Txt
          w="800"
          style={{
            fontSize: 10,
            letterSpacing: 0.7,
            color: colors.accentInk,
            marginBottom: 10,
            opacity: 0.9,
          }}
        >
          {h.chEyebrow}
        </Txt>
        <Txt w="800" style={{ fontSize: 23, color: colors.accentInk, maxWidth: 200 }}>
          {h.chTitle}
        </Txt>
        <Txt
          w="400"
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: colors.accentInk,
            opacity: 0.92,
            marginTop: 9,
            marginBottom: 16,
            maxWidth: 210,
          }}
        >
          {h.chBody}
        </Txt>
        <Pressable
          onPress={onChallenge}
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(255,255,255,0.96)',
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 13,
          }}
        >
          <Txt w="800" style={{ fontSize: 14, color: colors.accent }}>
            {h.chCta}
          </Txt>
          <Icon name="arrow-right" size={13} color={colors.accent} />
        </Pressable>
      </View>

      {/* current quest — only when the kid has one */}
      {quest && (
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorderColor,
            borderWidth: colors.cardBorderWidth,
            borderRadius: 24,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <Txt
            w="800"
            style={{ fontSize: 10, letterSpacing: 0.6, color: colors.ink3, marginBottom: 10 }}
          >
            {h.questEyebrow}
          </Txt>
          <Txt w="800" style={{ fontSize: 20, color: colors.ink }}>
            {quest.title}
          </Txt>
          <Txt
            w="400"
            style={{
              fontSize: 13,
              lineHeight: 20,
              color: colors.ink2,
              marginTop: 6,
              marginBottom: 14,
            }}
          >
            {quest.description}
          </Txt>
          <Pressable
            onPress={() => go('quests')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          >
            <Txt w="800" style={{ fontSize: 14, color: colors.accent }}>
              {h.questCta}
            </Txt>
            <Icon name="arrow-right" size={13} color={colors.accent} />
          </Pressable>
        </View>
      )}

      {/* ask coach */}
      <Pressable
        onPress={() => go('coach')}
        style={{
          backgroundColor: colors.soft,
          borderRadius: 20,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <Piggy mood="thinking" size={52} />
        <View style={{ flex: 1 }}>
          <Txt
            w="800"
            style={{ fontSize: 10, letterSpacing: 0.5, color: colors.ink3, marginBottom: 3 }}
          >
            {h.askEyebrow}
          </Txt>
          <Txt w="600" style={{ fontSize: 13.5, lineHeight: 19, color: colors.ink }}>
            {h.askBody}
          </Txt>
        </View>
        <Icon name="chevron-right" size={14} color={colors.ink3} />
      </Pressable>

      <View style={{ alignItems: 'center', paddingHorizontal: 10, paddingBottom: 8 }}>
        <Txt
          w="400"
          style={{
            fontSize: 13,
            lineHeight: 20,
            fontStyle: 'italic',
            textAlign: 'center',
            color: colors.ink2,
          }}
        >
          {h.tip}
        </Txt>
        <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.ink3, marginTop: 8 }}>
          {h.tipAuthor}
        </Txt>
      </View>
    </ScrollView>
  );
}
