import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useLang, useTheme } from '@/lib/providers';
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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) return;
    setError(null);
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch {
      setError(c.err);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    borderWidth: 2,
    borderColor: colors.divider,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.cardBg === 'transparent' ? colors.canvas : colors.cardBg,
  } as const;

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

        <View style={{ gap: 14 }}>
          <View style={{ gap: 6 }}>
            <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.ink3 }}>
              {c.user}
            </Txt>
            <TextInput
              accessibilityLabel={c.user}
              value={username}
              onChangeText={setUsername}
              placeholder={c.userPh}
              placeholderTextColor={colors.ink3}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.ink3 }}>
              {c.pass}
            </Txt>
            <TextInput
              accessibilityLabel={c.pass}
              value={password}
              onChangeText={setPassword}
              placeholder={c.passPh}
              placeholderTextColor={colors.ink3}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              onSubmitEditing={submit}
              style={inputStyle}
            />
          </View>

          {error && (
            <Txt w="700" style={{ fontSize: 13, color: colors.accent }}>
              {error}
            </Txt>
          )}

          <Pressable
            accessibilityRole="button"
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
              {busy ? c.busy : c.cta}
            </Txt>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
