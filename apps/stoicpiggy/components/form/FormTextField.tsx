import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form';
import { TextInput, type TextInputProps, View } from 'react-native';
import { useTheme } from '@/lib/providers';
import { Txt } from '../Txt';

type Props<TForm extends FieldValues> = {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label: string;
  /** Optional input sanitizer, e.g. strip non-digits for a numeric field. */
  sanitize?: (text: string) => string;
} & Pick<
  TextInputProps,
  | 'placeholder'
  | 'secureTextEntry'
  | 'keyboardType'
  | 'autoCapitalize'
  | 'autoComplete'
  | 'autoCorrect'
  | 'onSubmitEditing'
  | 'returnKeyType'
  | 'accessibilityLabel'
>;

/** A Controller-wrapped RN TextInput with a label and inline Zod error. */
export function FormTextField<TForm extends FieldValues>({
  control,
  name,
  label,
  sanitize,
  accessibilityLabel,
  ...inputProps
}: Props<TForm>) {
  const { colors } = useTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View style={{ gap: 6 }}>
          <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.ink3 }}>
            {label}
          </Txt>
          <TextInput
            accessibilityLabel={accessibilityLabel ?? label}
            value={field.value == null ? '' : String(field.value)}
            onChangeText={(text) => field.onChange(sanitize ? sanitize(text) : text)}
            onBlur={field.onBlur}
            placeholderTextColor={colors.ink3}
            style={{
              borderWidth: 2,
              borderColor: fieldState.error ? colors.accent : colors.divider,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: colors.ink,
              backgroundColor: colors.cardBg === 'transparent' ? colors.canvas : colors.cardBg,
            }}
            {...inputProps}
          />
          {fieldState.error?.message && (
            <Txt w="700" style={{ fontSize: 12.5, color: colors.accent }}>
              {fieldState.error.message}
            </Txt>
          )}
        </View>
      )}
    />
  );
}
