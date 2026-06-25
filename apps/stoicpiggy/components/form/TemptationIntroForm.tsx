import { temptationFormSchema } from '@stoicpiggy/schemas';
import { dollarsToCents } from '@stoicpiggy/shared';
import { Controller } from 'react-hook-form';
import { Pressable, TextInput, View } from 'react-native';
import { FONT } from '@/lib/fonts';
import { useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';
import { useZodForm } from './useZodForm';

type Copy = { eyebrow: string; wantLabel: string; wantBody: string; breatheCta: string };

/**
 * The Temptation intro: the kid enters a real impulse + price. Validates the
 * price (> 0) and hands the parsed item + amount in cents up to the screen,
 * which drives the breathe → decide → resisted flow.
 */
export function TemptationIntroForm({
  copy,
  itemPlaceholder,
  amountPlaceholder,
  onReady,
}: {
  copy: Copy;
  itemPlaceholder: string;
  amountPlaceholder: string;
  onReady: (values: { item?: string; amountCents: number }) => void;
}) {
  const { colors } = useTheme();
  const { control, handleSubmit, formState } = useZodForm(temptationFormSchema, {
    defaultValues: { item: '', amount: '' },
  });

  const input = {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.divider,
    color: colors.ink,
    fontFamily: FONT.regular,
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 14,
  } as const;

  const submit = handleSubmit(({ item, amount }) =>
    onReady({ item: item?.trim() || undefined, amountCents: dollarsToCents(amount) }),
  );

  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Txt
            w="800"
            style={{ fontSize: 11, letterSpacing: 1, color: colors.accent, marginBottom: 14 }}
          >
            {copy.eyebrow}
          </Txt>
          <Piggy mood="tempted" size={104} />
        </View>
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorderColor,
            borderWidth: colors.cardBorderWidth,
            borderRadius: 20,
            padding: 18,
            gap: 12,
          }}
        >
          <Txt w="800" style={{ fontSize: 10, letterSpacing: 0.6, color: colors.ink3 }}>
            {copy.wantLabel}
          </Txt>
          <Controller
            control={control}
            name="item"
            render={({ field }) => (
              <TextInput
                value={field.value == null ? '' : String(field.value)}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                placeholder={itemPlaceholder}
                placeholderTextColor={colors.ink3}
                style={input}
              />
            )}
          />
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <TextInput
                value={field.value == null ? '' : String(field.value)}
                onChangeText={(v) => field.onChange(v.replace(/[^0-9]/g, ''))}
                onBlur={field.onBlur}
                keyboardType="number-pad"
                placeholder={amountPlaceholder}
                placeholderTextColor={colors.ink3}
                style={input}
              />
            )}
          />
        </View>
        <Txt
          w="400"
          style={{
            fontSize: 14,
            lineHeight: 22,
            textAlign: 'center',
            color: colors.ink2,
            marginTop: 16,
          }}
        >
          {copy.wantBody}
        </Txt>
      </View>
      <Pressable
        onPress={submit}
        disabled={!formState.isValid}
        style={{
          backgroundColor: colors.accent,
          paddingVertical: 17,
          borderRadius: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 9,
          opacity: formState.isValid ? 1 : 0.5,
        }}
      >
        <Icon name="leaf" size={15} color={colors.accentInk} />
        <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
          {copy.breatheCta}
        </Txt>
      </Pressable>
    </>
  );
}
