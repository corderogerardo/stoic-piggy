import type { LoginChildInput } from '@stoicpiggy/schemas';
import { loginChildSchema } from '@stoicpiggy/schemas';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/providers';
import { Txt } from '../Txt';
import { FormTextField } from './FormTextField';
import { useZodForm } from './useZodForm';

type Copy = {
  user: string;
  userPh: string;
  pass: string;
  passPh: string;
  cta: string;
  busy: string;
};

/** Kid sign-in form. Owns field state + validation; the screen owns the auth call. */
export function LoginForm({
  copy,
  serverError,
  onSubmit,
}: {
  copy: Copy;
  serverError?: string | null;
  onSubmit: (values: LoginChildInput) => Promise<void>;
}) {
  const { colors } = useTheme();
  const { control, handleSubmit, formState } = useZodForm(loginChildSchema, {
    defaultValues: { username: '', password: '' },
  });
  const busy = formState.isSubmitting;
  const submit = handleSubmit(onSubmit);

  return (
    <View style={{ gap: 14 }}>
      <FormTextField
        control={control}
        name="username"
        testID="login-username"
        label={copy.user}
        placeholder={copy.userPh}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
      />
      <FormTextField
        control={control}
        name="password"
        testID="login-password"
        label={copy.pass}
        placeholder={copy.passPh}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />

      {serverError && (
        <Txt w="700" style={{ fontSize: 13, color: colors.accent }}>
          {serverError}
        </Txt>
      )}

      <Pressable
        accessibilityRole="button"
        testID="login-submit"
        onPress={submit}
        disabled={busy}
        style={{
          backgroundColor: colors.accent,
          paddingVertical: 16,
          borderRadius: 16,
          alignItems: 'center',
          marginTop: 4,
          opacity: busy ? 0.6 : 1,
        }}
      >
        <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
          {busy ? copy.busy : copy.cta}
        </Txt>
      </Pressable>
    </View>
  );
}
