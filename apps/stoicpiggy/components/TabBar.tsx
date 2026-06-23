import { Pressable, View } from 'react-native';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from './Icon';
import { Txt } from './Txt';

export function TabBar({ screen, onTab }: { screen: string; onTab: (key: string) => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const tabs = [
    { k: 'home', i: 'home', l: t.nav.home },
    { k: 'tasks', i: 'check-square-o', l: t.nav.tasks },
    { k: 'coach', i: 'commenting-o', l: t.nav.coach },
    { k: 'quests', i: 'compass', l: t.nav.learn },
    { k: 'wins', i: 'trophy', l: t.nav.wins },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.tabBg,
        borderTopColor: colors.tabBorderColor,
        borderTopWidth: colors.tabBorderWidth,
        paddingTop: 12,
        paddingBottom: 26,
        paddingHorizontal: 8,
      }}
    >
      {tabs.map((tab) => {
        const active = screen === tab.k;
        const color = active ? colors.accent : colors.ink3;
        return (
          <Pressable key={tab.k} onPress={() => onTab(tab.k)} style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 4 }}>
            <Icon name={tab.i} size={19} color={color} />
            <Txt w="800" style={{ fontSize: 10, letterSpacing: 0.4, color, textTransform: 'uppercase' }}>{tab.l}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
