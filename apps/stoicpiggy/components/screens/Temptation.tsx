import { useMyWins, useResistImpulse, useTRPC } from '@stoicpiggy/api';
import { centsToDollars } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useLang, useTheme } from '@/lib/providers';
import { TemptationIntroForm } from '../form/TemptationIntroForm';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

type Stage = 'intro' | 'breathing' | 'decide' | 'resisted' | 'bought';

/** The kid enters a real impulse + price; resisting logs it (the Wins screen counts it). */
export function Temptation({ onHome }: { onHome: () => void }) {
  const { colors } = useTheme();
  const { t, lang } = useLang();
  const tp = t.templ;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const winsQ = useMyWins();
  const resist = useResistImpulse();

  const [stage, setStage] = useState<Stage>('intro');
  // The intro form hands the parsed impulse up here; the later stages read it.
  const [submitted, setSubmitted] = useState<{ item?: string; amountCents: number }>({
    amountCents: 0,
  });
  const scale = useSharedValue(0.92);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (stage === 'breathing') {
      scale.value = withRepeat(withTiming(1.1, { duration: 1300 }), -1, true);
      timer.current = setTimeout(() => setStage((s) => (s === 'breathing' ? 'decide' : s)), 2900);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [stage, scale]);
  const breatheStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const resisted = winsQ.data?.resistedCount ?? 0;
  const { item = '', amountCents } = submitted;

  const onResist = async () => {
    setStage('resisted');
    await resist.mutateAsync({ amountCents, item: item.trim() || undefined });
    await queryClient.invalidateQueries({ queryKey: trpc.me.wins.queryKey() });
  };
  const reset = () => {
    setSubmitted({ amountCents: 0 });
    setStage('intro');
  };

  return (
    <View
      testID="temptation-screen"
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
          testID="temptation-close"
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
        <TemptationIntroForm
          copy={{
            eyebrow: tp.eyebrow,
            wantLabel: tp.wantLabel,
            wantBody: tp.wantBody,
            breatheCta: tp.breatheCta,
          }}
          itemPlaceholder={lang === 'es' ? '¿Qué quieres comprar?' : 'What do you want to buy?'}
          amountPlaceholder={lang === 'es' ? 'Precio en $' : 'Price in $'}
          onReady={(v) => {
            setSubmitted(v);
            setStage('breathing');
          }}
        />
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
            {!!item.trim() && (
              <Txt w="400" style={{ fontSize: 14, color: colors.ink2, marginTop: 10 }}>
                {item} · ${Math.round(centsToDollars(amountCents))}
              </Txt>
            )}
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
            onPress={() => setStage('bought')}
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
              <Icon name="snowflake-o" size={12} color={colors.accentInk} />
              <Txt w="800" style={{ fontSize: 12, color: colors.accentInk }}>
                {amountCents > 0
                  ? lang === 'es'
                    ? `+$${Math.round(centsToDollars(amountCents))} no gastados`
                    : `+$${Math.round(centsToDollars(amountCents))} not spent`
                  : lang === 'es'
                    ? 'Impulso resistido'
                    : 'Impulse resisted'}
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
          <Pressable onPress={reset} style={{ paddingVertical: 13, alignItems: 'center' }}>
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
