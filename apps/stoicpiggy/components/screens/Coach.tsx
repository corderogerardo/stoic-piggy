import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT } from '@/lib/fonts';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from '../Icon';
import { Piggy } from '../Piggy';
import { Txt } from '../Txt';

interface Msg {
  role: 'me' | 'piggy';
  text: string;
}

/** On-device LLM opt-in + status (Tier 2). Omitted when the runtime is absent. */
interface CoachAI {
  available: boolean;
  on: boolean;
  onToggle: () => void;
  ready: boolean;
  downloadProgress: number;
}

export function Coach({
  messages,
  suggestions,
  onSend,
  onReport,
  ai,
}: {
  messages: Msg[];
  suggestions: string[];
  onSend: (text: string) => void;
  /** Opens the "report a concern" contact path (App Store safeguard for child AI). */
  onReport?: () => void;
  ai?: CoachAI;
}) {
  const { colors } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const submit = (text: string) => {
    if (!text.trim()) return;
    onSend(text);
    setInput('');
  };

  return (
    // The KAV lives inside a top-inset SafeAreaView (app/index.tsx), so onLayout reports
    // its y as 0 (relative to parent) while its real screen-y is insets.top. With offset 0
    // the padding math comes up insets.top short and the composer hides behind the keyboard.
    // keyboardVerticalOffset = insets.top compensates. The TabBar is a sibling BELOW the KAV,
    // so it needs no term here — it just gets covered by the keyboard while typing.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 22,
          paddingTop: 10,
          paddingBottom: 14,
          borderBottomColor: colors.divider,
          borderBottomWidth: 1,
        }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.soft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Piggy mood="zen" size={38} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt w="800" style={{ fontSize: 16, color: colors.ink }}>
            {t.coach.name}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#2FAE6B' }} />
            <Txt w="800" style={{ fontSize: 10, letterSpacing: 0.5, color: colors.ink3 }}>
              {t.coach.status}
            </Txt>
          </View>
        </View>
      </View>

      {/* Always-visible AI disclosure + a reachable report path (child-AI safeguard). */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          paddingHorizontal: 22,
          paddingVertical: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Icon name="info-circle" size={11} color={colors.ink3} />
          <Txt w="600" style={{ fontSize: 10.5, color: colors.ink3 }}>
            {t.coach.disclaimer}
          </Txt>
        </View>
        {onReport && (
          <Pressable
            testID="coach-report"
            onPress={onReport}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Txt w="800" style={{ fontSize: 10.5, letterSpacing: 0.3, color: colors.accent }}>
              {t.coach.report}
            </Txt>
          </Pressable>
        )}
      </View>

      {ai?.available && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 22,
            paddingVertical: 10,
            backgroundColor: colors.soft,
          }}
        >
          <View style={{ flex: 1 }}>
            <Txt w="700" style={{ fontSize: 12.5, color: colors.ink }}>
              {t.coach.aiTitle}
            </Txt>
            <Txt w="400" style={{ fontSize: 10.5, color: colors.ink3 }}>
              {ai.on && !ai.ready
                ? `${t.coach.aiLoading} ${Math.round(ai.downloadProgress * 100)}%`
                : t.coach.aiHint}
            </Txt>
          </View>
          <Switch value={ai.on} onValueChange={ai.onToggle} />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((m, i) => {
          const me = m.role === 'me';
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: append-only chat log, message indices are stable
            <View key={`${m.role}-${i}`} style={{ alignItems: me ? 'flex-end' : 'flex-start' }}>
              <View
                style={{
                  maxWidth: '78%',
                  paddingVertical: 12,
                  paddingHorizontal: 15,
                  borderRadius: 18,
                  backgroundColor: me ? colors.accent : colors.soft,
                }}
                testID={`coach-message-${m.role}-${i}`}
                accessibilityLabel={`coach-message-${m.role}-${i}`}
              >
                <Txt
                  w="400"
                  style={{
                    fontSize: 13.5,
                    lineHeight: 20,
                    color: me ? colors.accentInk : colors.ink,
                  }}
                >
                  {m.text}
                </Txt>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          paddingHorizontal: 18,
          paddingVertical: 6,
        }}
      >
        {suggestions.map((s) => (
          <Pressable
            key={s}
            onPress={() => submit(s)}
            style={{
              backgroundColor: colors.chip,
              paddingHorizontal: 13,
              paddingVertical: 9,
              borderRadius: 9999,
            }}
          >
            <Txt w="600" style={{ fontSize: 12, color: colors.chipInk }}>
              {s}
            </Txt>
          </Pressable>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <TextInput
          testID="coach-input"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => submit(input)}
          placeholder={t.coach.placeholder}
          placeholderTextColor={colors.ink3}
          style={{
            flex: 1,
            paddingVertical: 13,
            paddingHorizontal: 16,
            borderRadius: 9999,
            borderWidth: 1.5,
            borderColor: colors.divider,
            color: colors.ink,
            fontFamily: FONT.regular,
            fontSize: 13.5,
          }}
        />
        <Pressable
          testID="coach-send"
          onPress={() => submit(input)}
          style={{
            width: 46,
            height: 46,
            borderRadius: 23,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="paper-plane" size={16} color={colors.accentInk} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
