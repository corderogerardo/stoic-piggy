import { ScrollView, View } from 'react-native';
import { ACHIEVEMENTS } from '@/lib/content';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Txt } from '../Txt';

export function Wins({ resisted }: { resisted: number }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const stats = [
    { v: '7', l: t.wins.stat1, accent: false },
    { v: '7', l: t.wins.stat2, accent: false },
    { v: String(resisted), l: t.wins.stat3, accent: true },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 24 }}>
      <Txt w="800" style={{ fontSize: 27, color: colors.ink, marginTop: 6 }}>{t.wins.title}</Txt>
      <Txt w="400" style={{ fontSize: 13.5, color: colors.ink2, marginBottom: 18 }}>{t.wins.sub}</Txt>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
        {stats.map((s) => (
          <View key={s.l} style={{ flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', backgroundColor: s.accent ? colors.accent : colors.darkBg }}>
            <Txt mono style={{ fontSize: 26, color: s.accent ? colors.accentInk : colors.darkInk }}>{s.v}</Txt>
            <Txt w="800" style={{ fontSize: 9, letterSpacing: 0.5, marginTop: 3, color: s.accent ? colors.accentInk : colors.darkInk2 }}>{s.l}</Txt>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {ACHIEVEMENTS.map((a, i) => {
          const info = a[lang];
          return (
            <View key={`${a.icon}-${i}`} style={{ width: '47%', flexGrow: 1, backgroundColor: colors.cardBg, borderColor: colors.cardBorderColor, borderWidth: colors.cardBorderWidth, borderRadius: 20, padding: 16, alignItems: 'center', opacity: a.earned ? 1 : 0.5 }}>
              <View style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 11, backgroundColor: a.earned ? colors.accent : colors.chip }}>
                <Icon name={a.icon} size={21} color={a.earned ? colors.accentInk : colors.ink3} />
              </View>
              <Txt w="800" style={{ fontSize: 13.5, textAlign: 'center', color: colors.ink }}>{info.t}</Txt>
              <Txt w="400" style={{ fontSize: 11.5, textAlign: 'center', color: colors.ink2, marginTop: 3 }}>{info.d}</Txt>
              <Txt w="800" style={{ fontSize: 8.5, letterSpacing: 0.5, marginTop: 9, color: a.earned ? colors.accent : colors.ink3 }}>{a.earned ? t.wins.earned : t.wins.locked}</Txt>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
