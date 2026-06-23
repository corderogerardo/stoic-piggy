import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

interface TemptationProps {
  stage: string;
  resisted: number;
  onBreathe: () => void;
  onResist: () => void;
  onBuy: () => void;
  onAgain: () => void;
  onHome: () => void;
}

export function Temptation({
  stage,
  resisted,
  onBreathe,
  onResist,
  onBuy,
  onAgain,
  onHome,
}: TemptationProps) {
  const { colors } = useTheme();
  const { t } = useLang();
  const tp = t.templ;
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (stage === 'breathing')
      scale.value = withRepeat(withTiming(1.1, { duration: 1300 }), -1, true);
  }, [stage, scale]);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.canvas,
        paddingHorizontal: 26,
        paddingTop: 14,
        paddingBottom: 30,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Pressable
          onPress={onHome}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.chip,
          }}
        >
          <Icon name="times" size={15} color={colors.ink} />
        </Pressable>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            backgroundColor: colors.chip,
            paddingHorizontal: 13,
            paddingVertical: 7,
            borderRadius: 9999,
          }}
        >
          <Icon name="snowflake-o" size={11} color={colors.accent} />
          <Txt w="800" style={{ fontSize: 9, letterSpacing: 0.5, color: colors.ink2 }}>
            {resisted} {tp.resistedLabel}
          </Txt>
        </View>
      </View>

      {stage === 'intro' && (
        <>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Txt
              w="800"
              style={{ fontSize: 11, letterSpacing: 1, color: colors.accent, marginBottom: 18 }}
            >
              {tp.eyebrow}
            </Txt>
            <Piggy mood="tempted" size={120} />
            <View
              style={{
                width: '100%',
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorderColor,
                borderWidth: colors.cardBorderWidth,
                borderRadius: 20,
                padding: 18,
                marginVertical: 18,
              }}
            >
              <Txt
                w="800"
                style={{ fontSize: 10, letterSpacing: 0.6, color: colors.ink3, marginBottom: 8 }}
              >
                {tp.wantLabel}
              </Txt>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <Txt w="800" style={{ fontSize: 18, color: colors.ink, flex: 1 }}>
                  {tp.wantItem}
                </Txt>
                <Txt mono style={{ fontSize: 22, color: colors.accent }}>
                  {tp.wantPrice}
                </Txt>
              </View>
            </View>
            <Txt
              w="400"
              style={{
                fontSize: 14,
                lineHeight: 22,
                textAlign: 'center',
                color: colors.ink2,
                maxWidth: 300,
              }}
            >
              {tp.wantBody}
            </Txt>
          </View>
          <Pressable
            onPress={onBreathe}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 17,
              borderRadius: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 9,
            }}
          >
            <Icon name="leaf" size={15} color={colors.accentInk} />
            <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
              {tp.breatheCta}
            </Txt>
          </Pressable>
          <Pressable
            onPress={onBuy}
            style={{ paddingVertical: 13, alignItems: 'center', marginTop: 8 }}
          >
            <Txt
              w="700"
              style={{ fontSize: 13, color: colors.ink3, textDecorationLine: 'underline' }}
            >
              {tp.buyNow}
            </Txt>
          </Pressable>
        </>
      )}

      {stage === 'breathing' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={breatheStyle}>
            <Piggy mood="zen" size={130} />
          </Animated.View>
          <Txt w="800" style={{ fontSize: 26, color: colors.ink, marginTop: 34 }}>
            {tp.breathing}
          </Txt>
          <Txt w="400" style={{ fontSize: 14, color: colors.ink2, marginTop: 10 }}>
            {tp.breathingSub}
          </Txt>
        </View>
      )}

      {stage === 'decide' && (
        <>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Piggy mood="thinking" size={120} />
            <Txt
              w="800"
              style={{
                fontSize: 22,
                lineHeight: 28,
                textAlign: 'center',
                color: colors.ink,
                maxWidth: 280,
                marginTop: 18,
              }}
            >
              {tp.decideQ}
            </Txt>
          </View>
          <Pressable
            onPress={onResist}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 17,
              borderRadius: 16,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
              {tp.resist}
            </Txt>
          </Pressable>
          <Pressable
            onPress={onBuy}
            style={{
              paddingVertical: 15,
              borderRadius: 16,
              alignItems: 'center',
              borderColor: colors.cardBorderColor,
              borderWidth: colors.cardBorderWidth,
            }}
          >
            <Txt w="800" style={{ fontSize: 14, color: colors.ink }}>
              {tp.buyAnyway}
            </Txt>
          </Pressable>
        </>
      )}

      {stage === 'resisted' && (
        <>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Piggy mood="happy" size={128} />
            <Txt w="800" style={{ fontSize: 30, color: colors.accent, marginTop: 14 }}>
              {tp.wonTitle}
            </Txt>
            <Txt
              w="400"
              style={{
                fontSize: 14.5,
                lineHeight: 22,
                textAlign: 'center',
                color: colors.ink2,
                marginVertical: 12,
                maxWidth: 300,
              }}
            >
              {tp.wonBody}
            </Txt>
            <View
              style={{ backgroundColor: colors.soft, borderRadius: 18, padding: 16, width: '100%' }}
            >
              <Txt
                w="400"
                style={{ fontSize: 13.5, fontStyle: 'italic', lineHeight: 20, color: colors.ink }}
              >
                {tp.wonQuote}
              </Txt>
              <Txt w="800" style={{ fontSize: 11, color: colors.ink3, marginTop: 7 }}>
                {tp.wonAuthor}
              </Txt>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: colors.accent,
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 9999,
                marginTop: 16,
              }}
            >
              <Icon name="bolt" size={12} color={colors.accentInk} />
              <Txt w="800" style={{ fontSize: 12, color: colors.accentInk }}>
                {tp.wonXp}
              </Txt>
            </View>
          </View>
          <Pressable
            onPress={onHome}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 17,
              borderRadius: 16,
              alignItems: 'center',
              marginBottom: 9,
            }}
          >
            <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
              {tp.wonCta}
            </Txt>
          </Pressable>
          <Pressable onPress={onAgain} style={{ paddingVertical: 13, alignItems: 'center' }}>
            <Txt w="700" style={{ fontSize: 13.5, color: colors.ink2 }}>
              {tp.again}
            </Txt>
          </Pressable>
        </>
      )}

      {stage === 'bought' && (
        <>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Piggy mood="zen" size={124} />
            <Txt w="800" style={{ fontSize: 30, color: colors.ink, marginTop: 14 }}>
              {tp.boughtTitle}
            </Txt>
            <Txt
              w="400"
              style={{
                fontSize: 14.5,
                lineHeight: 23,
                textAlign: 'center',
                color: colors.ink2,
                marginTop: 12,
                maxWidth: 300,
              }}
            >
              {tp.boughtBody}
            </Txt>
          </View>
          <Pressable
            onPress={onHome}
            style={{
              backgroundColor: colors.ink,
              paddingVertical: 17,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Txt w="800" style={{ fontSize: 16, color: colors.canvas }}>
              {tp.boughtCta}
            </Txt>
          </Pressable>
        </>
      )}
    </View>
  );
}
