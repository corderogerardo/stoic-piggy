import { formatMoney, levelForXp, levelUpRewardCents } from '@stoicpiggy/shared';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Lesson } from '@/lib/lessons';
import { useLang, useTheme } from '@/lib/providers';
import { Icon } from './Icon';
import { Piggy } from './Piggy';
import { Txt } from './Txt';

const GOOD = '#2A9D8F';

interface Props {
  lesson: Lesson;
  title: string;
  rewardXp: number;
  /** The kid's XP before claiming — used to predict the level-up + cash reward. */
  currentXp: number;
  /** Already-claimed lesson: read the cards again, no quiz, no reward. */
  reviewMode: boolean;
  /** Claims the quest (credits XP + any level-up money on the backend). */
  onClaim: () => Promise<void>;
  onClose: () => void;
}

/** Full-screen lesson: swipe teaching cards → quiz → result. */
export function LessonFlow({
  lesson,
  title,
  rewardXp,
  currentXp,
  reviewMode,
  onClaim,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const { t } = useLang();
  const L = t.lessons;
  const insets = useSafeAreaInsets();

  const [phase, setPhase] = useState<'cards' | 'quiz' | 'result'>('cards');
  const [cardI, setCardI] = useState(0);
  const [quizI, setQuizI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);

  const cards = lesson.cards;
  const quiz = lesson.quiz;
  const card = cards[cardI];
  const q = quiz[quizI];

  const lastCard = cardI >= cards.length - 1;
  const nextCard = () => {
    if (!lastCard) setCardI((i) => i + 1);
    else if (reviewMode || quiz.length === 0) onClose();
    else setPhase('quiz');
  };

  // Wrong answer → clear and let them try again (Duolingo-style: you can't fail
  // out, you just keep going until it clicks). Right → advance / finish.
  const quizNext = () => {
    if (picked === null || !q) return;
    if (picked !== q.answer) {
      setPicked(null);
      return;
    }
    if (quizI < quiz.length - 1) {
      setQuizI((i) => i + 1);
      setPicked(null);
    } else {
      setPhase('result');
    }
  };

  // Honest client-side prediction using the same pure helpers the backend uses.
  const newXp = currentXp + rewardXp;
  const leveledUp = levelForXp(newXp) > levelForXp(currentXp);
  const moneyCents = levelUpRewardCents(currentXp, newXp);
  const newTier = t.levels[Math.min(levelForXp(newXp), t.levels.length) - 1] ?? '';

  const claim = async () => {
    setClaiming(true);
    try {
      await onClaim();
      onClose();
    } finally {
      setClaiming(false);
    }
  };

  const pct =
    phase === 'result'
      ? 100
      : phase === 'quiz'
        ? Math.round(((quizI + 1) / quiz.length) * 100)
        : Math.round(((cardI + 1) / cards.length) * 100);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingBottom: insets.bottom }}>
        {/* header: progress bar + close */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingHorizontal: 18,
            paddingTop: insets.top + 8,
            paddingBottom: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 9,
              borderRadius: 9999,
              backgroundColor: colors.chip,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: colors.accent,
                borderRadius: 9999,
              }}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={L.close}
            onPress={onClose}
            hitSlop={10}
          >
            <Icon name="times" size={20} color={colors.ink3} />
          </Pressable>
        </View>

        {phase === 'cards' && card && (
          <CardsView
            card={card}
            title={title}
            index={cardI}
            dotKeys={cards.map((c) => c.title)}
            reviewMode={reviewMode}
            ctaLabel={reviewMode && lastCard ? L.close : L.cont}
            reviewNote={L.reviewNote}
            onNext={nextCard}
            colors={colors}
          />
        )}

        {phase === 'quiz' && q && (
          <QuizView
            q={q}
            index={quizI}
            total={quiz.length}
            picked={picked}
            onPick={(i) => picked === null && setPicked(i)}
            onNext={quizNext}
            L={L}
            colors={colors}
          />
        )}

        {phase === 'result' && (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 28,
              gap: 8,
            }}
          >
            <Piggy mood="happy" size={120} />
            <Txt
              w="800"
              style={{ fontSize: 26, color: colors.ink, marginTop: 10, textAlign: 'center' }}
            >
              {L.passTitle}
            </Txt>
            <Txt
              w="400"
              style={{ fontSize: 14, color: colors.ink2, textAlign: 'center', marginBottom: 8 }}
            >
              {L.passSub}
            </Txt>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                backgroundColor: colors.soft,
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 9999,
              }}
            >
              <Icon name="bolt" size={16} color={colors.accent} />
              <Txt w="800" style={{ fontSize: 18, color: colors.ink }}>
                +{rewardXp} {L.xpEarned}
              </Txt>
            </View>

            {leveledUp && (
              <View
                style={{
                  marginTop: 18,
                  alignSelf: 'stretch',
                  backgroundColor: colors.darkBg,
                  borderRadius: 20,
                  padding: 20,
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icon name="trophy" size={22} color={colors.darkInk} />
                <Txt w="800" style={{ fontSize: 18, color: colors.darkInk }}>
                  {L.levelUp}
                </Txt>
                <Txt w="800" style={{ fontSize: 13, letterSpacing: 0.5, color: colors.darkInk2 }}>
                  {newTier.toUpperCase()}
                </Txt>
                {moneyCents > 0 && (
                  <Txt w="800" style={{ fontSize: 22, color: GOOD, marginTop: 4 }}>
                    {L.moneyEarned} {formatMoney(moneyCents)}
                  </Txt>
                )}
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={claiming}
              onPress={claim}
              style={{
                marginTop: 26,
                alignSelf: 'stretch',
                alignItems: 'center',
                backgroundColor: colors.accent,
                paddingVertical: 16,
                borderRadius: 16,
                opacity: claiming ? 0.6 : 1,
              }}
            >
              <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
                {L.claim}
              </Txt>
            </Pressable>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

function CardsView({
  card,
  title,
  index,
  dotKeys,
  reviewMode,
  reviewNote,
  ctaLabel,
  onNext,
  colors,
}: {
  card: Lesson['cards'][number];
  title: string;
  index: number;
  /** Stable per-card keys (card titles) for the progress dots. */
  dotKeys: string[];
  reviewMode: boolean;
  reviewNote: string;
  ctaLabel: string;
  onNext: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 20 }}>
      <Txt
        w="800"
        style={{ fontSize: 11, letterSpacing: 0.6, color: colors.ink3, marginBottom: 4 }}
      >
        {title.toUpperCase()}
      </Txt>
      {reviewMode && (
        <Txt w="600" style={{ fontSize: 12, color: colors.ink3, marginBottom: 8 }}>
          {reviewNote}
        </Txt>
      )}
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Txt w="800" style={{ fontSize: 30, lineHeight: 36, color: colors.ink, marginBottom: 16 }}>
          {card.title}
        </Txt>
        <Txt w="400" style={{ fontSize: 17, lineHeight: 26, color: colors.ink2 }}>
          {card.body}
        </Txt>
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
        {dotKeys.map((k, i) => (
          <View
            key={k}
            style={{
              width: i === index ? 22 : 7,
              height: 7,
              borderRadius: 9999,
              backgroundColor: i === index ? colors.accent : colors.chip,
            }}
          />
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onNext}
        style={{
          alignItems: 'center',
          backgroundColor: colors.accent,
          paddingVertical: 16,
          borderRadius: 16,
        }}
      >
        <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
          {ctaLabel}
        </Txt>
      </Pressable>
    </View>
  );
}

function QuizView({
  q,
  index,
  total,
  picked,
  onPick,
  onNext,
  L,
  colors,
}: {
  q: Lesson['quiz'][number];
  index: number;
  total: number;
  picked: number | null;
  onPick: (i: number) => void;
  onNext: () => void;
  L: ReturnType<typeof useLang>['t']['lessons'];
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const answered = picked !== null;
  const right = answered && picked === q.answer;
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 20 }}>
      <Txt
        w="800"
        style={{ fontSize: 11, letterSpacing: 0.6, color: colors.ink3, marginBottom: 12 }}
      >
        {L.question} {index + 1} {L.of} {total}
      </Txt>
      <Txt w="800" style={{ fontSize: 23, lineHeight: 30, color: colors.ink, marginBottom: 22 }}>
        {q.q}
      </Txt>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const reveal = answered && i === q.answer;
          const wrongPick = answered && isPicked && i !== q.answer;
          const borderColor = reveal ? GOOD : wrongPick ? colors.accent : colors.cardBorderColor;
          const bg = reveal ? `${GOOD}22` : wrongPick ? `${colors.accent}18` : colors.cardBg;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              disabled={answered}
              onPress={() => onPick(i)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: bg,
                borderColor,
                borderWidth: 2,
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 18,
              }}
            >
              <Txt w="600" style={{ flex: 1, fontSize: 15.5, color: colors.ink }}>
                {opt}
              </Txt>
              {reveal && <Icon name="check" size={16} color={GOOD} />}
              {wrongPick && <Icon name="times" size={16} color={colors.accent} />}
            </Pressable>
          );
        })}
      </ScrollView>

      {answered && (
        <View style={{ paddingTop: 14, gap: 12 }}>
          <Txt w="800" style={{ fontSize: 15, color: right ? GOOD : colors.accent }}>
            {right ? L.correct : L.almost}
          </Txt>
          <Txt w="400" style={{ fontSize: 13.5, lineHeight: 20, color: colors.ink2 }}>
            {q.explain}
          </Txt>
          <Pressable
            accessibilityRole="button"
            onPress={onNext}
            style={{
              alignItems: 'center',
              backgroundColor: colors.accent,
              paddingVertical: 16,
              borderRadius: 16,
            }}
          >
            <Txt w="800" style={{ fontSize: 16, color: colors.accentInk }}>
              {right ? L.cont : L.retry}
            </Txt>
          </Pressable>
        </View>
      )}
    </View>
  );
}
