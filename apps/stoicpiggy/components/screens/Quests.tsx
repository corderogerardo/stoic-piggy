import { ScrollView, View } from 'react-native';
import { QUESTS } from '@/lib/content';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Txt } from '../Txt';

export function Quests() {
  const { colors } = useTheme();
  const { t, lang } = useLang();

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24 }}>
      <Txt w="800" style={{ fontSize: 27, color: colors.ink, marginTop: 6 }}>{t.lessons.title}</Txt>
      <Txt w="400" style={{ fontSize: 13.5, color: colors.ink2, marginBottom: 20 }}>{t.lessons.sub}</Txt>
      <View style={{ gap: 13 }}>
        {QUESTS.map((q, idx) => {
          const done = q.status === 'done';
          const locked = q.status === 'locked';
          let pct = 0;
          if (done) pct = 100;
          else if (q.prog) {
            const parts = q.prog.split('/');
            pct = Math.round((Number(parts[0] ?? 0) / Number(parts[1] ?? 1)) * 100);
          }
          const label = done ? t.lessons.done : q.status === 'prog' ? t.lessons.prog : t.lessons.locked;
          const info = q[lang];
          return (
            <View key={`${q.icon}-${idx}`} style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorderColor, borderWidth: colors.cardBorderWidth, borderRadius: 20, padding: 18, opacity: locked ? 0.5 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 12 }}>
                <View style={{ width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? colors.accent : locked ? colors.chip : colors.soft }}>
                  <Icon name={q.icon} size={19} color={done ? colors.accentInk : locked ? colors.ink3 : colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt w="800" style={{ fontSize: 16, color: colors.ink }}>{info.t}</Txt>
                  <Txt w="400" style={{ fontSize: 12.5, color: colors.ink2, marginTop: 2 }}>{info.d}</Txt>
                </View>
                <View style={{ backgroundColor: done ? colors.accent : locked ? colors.chip : colors.soft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999 }}>
                  <Txt w="800" style={{ fontSize: 9, letterSpacing: 0.4, color: done ? colors.accentInk : colors.ink2 }}>{label}</Txt>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, height: 6, borderRadius: 9999, backgroundColor: colors.chip, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${pct}%`, backgroundColor: colors.accent, borderRadius: 9999 }} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="bolt" size={11} color={colors.accent} />
                  <Txt w="800" style={{ fontSize: 11, color: colors.ink3 }}>{q.xp} XP</Txt>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
