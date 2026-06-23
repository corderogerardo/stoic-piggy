import { Pressable, ScrollView, View } from 'react-native';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

export function Onboarding({ onStart }: { onStart: () => void }) {
  const { colors } = useTheme();
  const { t } = useLang();
  const ob = t.ob;
  const features = [
    { icon: 'hand-stop-o', title: ob.f1, desc: ob.f1d },
    { icon: 'compass', title: ob.f2, desc: ob.f2d },
    { icon: 'commenting-o', title: ob.f3, desc: ob.f3d },
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 30, paddingVertical: 24 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ marginBottom: 26, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              position: 'absolute',
              width: 168,
              height: 168,
              borderRadius: 84,
              backgroundColor: colors.soft,
            }}
          />
          <Piggy mood="zen" size={140} />
        </View>
        <Txt
          w="800"
          style={{ fontSize: 11, letterSpacing: 1, color: colors.accent, marginBottom: 14 }}
        >
          {ob.eyebrow}
        </Txt>
        <Txt
          w="800"
          style={{ fontSize: 33, lineHeight: 37, textAlign: 'center', color: colors.ink }}
        >
          {ob.title1}
          {'\n'}
          {ob.title2}
        </Txt>
        <Txt
          w="400"
          style={{
            fontSize: 14.5,
            lineHeight: 23,
            textAlign: 'center',
            color: colors.ink2,
            marginTop: 16,
            maxWidth: 300,
          }}
        >
          {ob.sub}
        </Txt>
      </View>

      <View style={{ gap: 12, marginVertical: 28 }}>
        {features.map((f) => (
          <View key={f.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.soft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={f.icon} size={17} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt w="800" style={{ fontSize: 14, color: colors.ink }}>
                {f.title}
              </Txt>
              <Txt w="400" style={{ fontSize: 12.5, color: colors.ink2 }}>
                {f.desc}
              </Txt>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onStart}
        style={{
          backgroundColor: colors.accent,
          paddingVertical: 17,
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
          {ob.cta}
        </Txt>
      </Pressable>
      <Pressable
        onPress={onStart}
        style={{ paddingVertical: 13, alignItems: 'center', marginTop: 8 }}
      >
        <Txt w="700" style={{ fontSize: 13.5, color: colors.ink2 }}>
          {ob.login}
        </Txt>
      </Pressable>
    </ScrollView>
  );
}
