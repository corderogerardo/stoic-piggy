import type { LoginChildInput } from '@stoicpiggy/schemas';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useLang, useTheme } from '@/lib/providers';
import { LoginForm } from '../form/LoginForm';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

const COPY = {
  es: {
    eyebrow: 'STOIC PIGGY',
    title: 'Hola de nuevo',
    sub: 'Entra con el usuario que te dieron tus papás.',
    user: 'USUARIO',
    userPh: 'tu usuario',
    pass: 'CONTRASEÑA',
    passPh: 'tu contraseña',
    cta: 'Entrar',
    busy: 'Entrando…',
    err: 'Usuario o contraseña incorrectos.',
  },
  en: {
    eyebrow: 'STOIC PIGGY',
    title: 'Welcome back',
    sub: 'Sign in with the username your parents gave you.',
    user: 'USERNAME',
    userPh: 'your username',
    pass: 'PASSWORD',
    passPh: 'your password',
    cta: 'Sign in',
    busy: 'Signing in…',
    err: 'Wrong username or password.',
  },
} as const;

export function Login() {
  const { colors } = useTheme();
  const { lang } = useLang();
  const { login } = useAuth();
  const c = COPY[lang];
  const [serverError, setServerError] = useState<string | null>(null);

  // The form validates + manages field state; the screen owns the auth mutation
  // and surfaces its failure. RHF keeps isSubmitting true until this resolves.
  const onSubmit = async (values: LoginChildInput) => {
    setServerError(null);
    try {
      await login(values.username, values.password);
    } catch {
      setServerError(c.err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.canvas }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 30 }}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Piggy mood="zen" size={104} />
          <Txt
            w="800"
            style={{ fontSize: 11, letterSpacing: 1, color: colors.accent, marginTop: 14 }}
          >
            {c.eyebrow}
          </Txt>
          <Txt w="800" style={{ fontSize: 28, color: colors.ink, marginTop: 6 }}>
            {c.title}
          </Txt>
          <Txt
            w="400"
            style={{
              fontSize: 14,
              lineHeight: 21,
              textAlign: 'center',
              color: colors.ink2,
              marginTop: 8,
              maxWidth: 280,
            }}
          >
            {c.sub}
          </Txt>
        </View>

        <LoginForm copy={c} serverError={serverError} onSubmit={onSubmit} />
      </View>
    </KeyboardAvoidingView>
  );
}
