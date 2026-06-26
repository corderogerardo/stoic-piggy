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
  ai,
}: {
  messages: Msg[];
  suggestions: string[];
  onSend: (text: string) => void;
  ai?: CoachAI;
}) {
  const { colors } = useTheme();
  const { t } = useLang();
  const [input, setInput] = useState('');
  const submit = (text: string) => {
    if (!text.trim()) return;
    onSend(text);
    setInput('');
  };

  return (
    // ponytail: TabBar is a sibling OUTSIDE this view (app/index.tsx), so the KAV's
    // measured frame already ends above it — keyboardVerticalOffset stays 0. A positive
    // offset would push the composer up past the keyboard by the TabBar's height.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
