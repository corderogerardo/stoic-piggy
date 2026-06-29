import { useRequestAccountDeletion } from '@stoicpiggy/api';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { useAuth } from '@/lib/auth';
import { PRIVACY_URL, supportMailto, TERMS_URL } from '@/lib/links';
import { useLang, useTheme } from '@/lib/providers';
import type { ThemeColors } from '@/lib/theme';

const DANGER = '#E63946';

/**
 * Settings / About — the in-app home for the App Store essentials: links to the
 * Privacy Policy + Terms, a way to contact support / report a concern, and the
 * account-deletion affordance (5.1.1(v)). The kid can't self-delete the
 * parent-owned account, so "Delete account" emails the parent the delete link.
 */
export default function Settings() {
  const { colors } = useTheme();
  const { t } = useLang();
  const s = t.settings;
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const requestDeletion = useRequestAccountDeletion();

  const onLogout = async () => {
    await logout();
    router.back();
  };

  const onDeleteAccount = () => {
    Alert.alert(s.deleteTitle, s.deleteBody, [
      { text: s.deleteCancel, style: 'cancel' },
      {
        text: s.deleteSend,
        style: 'destructive',
        onPress: async () => {
          // Best-effort: the backend swallows mail errors and always resolves OK,
          // so the kid never sees a failure for asking.
          try {
            await requestDeletion.mutateAsync();
          } catch {}
          Alert.alert(s.deleteDoneTitle, s.deleteDoneBody);
        },
      },
    ]);
  };

  const version = Constants.expoConfig?.version ?? '';

  return (
    <View
      testID="settings-screen"
      style={{ flex: 1, backgroundColor: colors.canvas, paddingBottom: insets.bottom }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 18,
          paddingTop: insets.top + 10,
          paddingBottom: 14,
        }}
      >
        <Pressable
          testID="settings-back"
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={20} color={colors.ink} />
        </Pressable>
        <Txt w="800" style={{ fontSize: 20, color: colors.ink, flex: 1 }}>
          {s.title}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28, gap: 8 }}>
        <Section label={s.legalSection} colors={colors} />
        <Row
          icon="lock"
          label={s.privacy}
          onPress={() => Linking.openURL(PRIVACY_URL)}
          colors={colors}
          testID="settings-privacy"
        />
        <Row
          icon="file-text-o"
          label={s.terms}
          onPress={() => Linking.openURL(TERMS_URL)}
          colors={colors}
          testID="settings-terms"
        />

        <Section label={s.helpSection} colors={colors} />
        <Row
          icon="envelope"
          label={s.contact}
          onPress={() => Linking.openURL(supportMailto('Stoic Piggy — Support'))}
          colors={colors}
          testID="settings-contact"
        />
        <Row
          icon="flag"
          label={s.report}
          onPress={() => Linking.openURL(supportMailto('Stoic Piggy — Report a concern'))}
          colors={colors}
          testID="settings-report"
        />

        <Section label={s.accountSection} colors={colors} />
        <Row
          icon="sign-out"
          label={s.logout}
          onPress={onLogout}
          colors={colors}
          testID="settings-logout"
        />
        <Row
          icon="trash"
          label={s.deleteAccount}
          onPress={onDeleteAccount}
          colors={colors}
          danger
          testID="settings-delete"
        />

        <Txt w="400" style={{ fontSize: 12, lineHeight: 18, color: colors.ink3, marginTop: 12 }}>
          {s.deleteFooter}
        </Txt>
        <Txt w="400" style={{ fontSize: 12, lineHeight: 18, color: colors.ink3, marginTop: 10 }}>
          {s.aiNote}
        </Txt>
        {version ? (
          <Txt w="600" style={{ fontSize: 11, color: colors.ink3, marginTop: 14 }}>
            {s.version} {version}
          </Txt>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Section({ label, colors }: { label: string; colors: ThemeColors }) {
  return (
    <Txt
      w="800"
      style={{
        fontSize: 10,
        letterSpacing: 0.6,
        color: colors.ink3,
        marginTop: 16,
        marginBottom: 4,
      }}
    >
      {label}
    </Txt>
  );
}

function Row({
  icon,
  label,
  onPress,
  colors,
  danger,
  testID,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
  danger?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 15,
        paddingHorizontal: 16,
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorderColor,
        borderWidth: colors.cardBorderWidth,
        borderRadius: 16,
      }}
    >
      <Icon name={icon} size={16} color={danger ? DANGER : colors.accent} />
      <Txt w="600" style={{ flex: 1, fontSize: 14.5, color: danger ? DANGER : colors.ink }}>
        {label}
      </Txt>
      <Icon name="chevron-right" size={13} color={colors.ink3} />
    </Pressable>
  );
}
