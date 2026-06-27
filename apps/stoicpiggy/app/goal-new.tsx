import { useChildHome, useCreateGoal, useTRPC } from '@stoicpiggy/api';
import { createGoalFormSchema, type GoalCategory, type GoalTerm } from '@stoicpiggy/shared';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FormTextField } from '@/components/form/FormTextField';
import { useZodForm } from '@/components/form/useZodForm';
import { Icon } from '@/components/Icon';
import { Txt } from '@/components/Txt';
import { useLang, useTheme } from '@/lib/providers';

type Colors = ReturnType<typeof useTheme>['colors'];

const TERMS: GoalTerm[] = ['short', 'medium', 'long'];
const CATEGORIES: GoalCategory[] = ['thing', 'invest', 'learn'];

export default function GoalNewScreen() {
  const { colors } = useTheme();
  const { t } = useLang();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const home = useChildHome();
  const childId = home.data?.child.id ?? '';
  const createGoal = useCreateGoal();
  const insets = useSafeAreaInsets();

  const { control, handleSubmit } = useZodForm(createGoalFormSchema, {
    defaultValues: { title: '', dollars: '', term: 'short', category: 'thing' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createGoal.mutateAsync({
      title: values.title,
      targetCents: values.dollars * 100,
      term: values.term,
      category: values.category,
    });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.goals.listByChild.queryKey({ childId }) }),
      queryClient.invalidateQueries({ queryKey: trpc.me.home.queryKey() }),
    ]);
    router.back();
  });

  return (
    <KeyboardAvoidingView
      testID="goal-new-screen"
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 22,
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          gap: 12,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t.goals.cancel}>
          <Icon name="times" size={18} color={colors.ink3} />
        </Pressable>
        <Txt w="800" style={{ fontSize: 19, color: colors.ink }}>
          {t.goals.tabCustom}
        </Txt>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 32, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormTextField
          control={control}
          name="title"
          label={t.goals.nameLabel}
          placeholder={t.goals.namePh}
          returnKeyType="next"
          autoFocus
          testID="goal-new-title"
        />
        <FormTextField
          control={control}
          name="dollars"
          label={t.goals.targetLabel}
          placeholder={t.goals.targetPh}
          keyboardType="number-pad"
          sanitize={(x) => x.replace(/[^0-9]/g, '')}
          testID="goal-new-dollars"
        />

        <Field label={t.goals.termLabel} colors={colors}>
          <Controller
            control={control}
            name="term"
            render={({ field }) => (
              <Segmented
                options={TERMS.map((k) => ({ k, label: t.goals.term[k] }))}
                value={field.value}
                onChange={field.onChange}
                colors={colors}
              />
            )}
          />
        </Field>

        <Field label={t.goals.catLabel} colors={colors}>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Segmented
                options={CATEGORIES.map((k) => ({ k, label: t.goals.cat[k] }))}
                value={field.value}
                onChange={field.onChange}
                colors={colors}
              />
            )}
          />
        </Field>

        <Pressable
          testID="goal-new-submit"
          disabled={createGoal.isPending}
          onPress={onSubmit}
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 15,
            borderRadius: 14,
            alignItems: 'center',
            opacity: createGoal.isPending ? 0.6 : 1,
            marginTop: 4,
          }}
        >
          <Txt w="800" style={{ fontSize: 15, color: colors.accentInk }}>
            {t.goals.create}
          </Txt>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ponytail: same shape as Goals.tsx helpers — not extracted because used in only 2 files
function Field({
  label,
  colors,
  children,
}: {
  label: string;
  colors: Colors;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Txt w="800" style={{ fontSize: 11, letterSpacing: 0.5, color: colors.ink3 }}>
        {label}
      </Txt>
      {children}
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  colors,
}: {
  options: { k: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  colors: Colors;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((o) => {
        const on = value === o.k;
        return (
          <Pressable
            key={o.k}
            onPress={() => onChange(o.k)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 11,
              paddingHorizontal: 4,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: on ? colors.accent : colors.divider,
              backgroundColor: on ? colors.soft : 'transparent',
            }}
          >
            <Txt
              w="800"
              style={{
                fontSize: 11.5,
                textAlign: 'center',
                color: on ? colors.accent : colors.ink2,
              }}
            >
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
