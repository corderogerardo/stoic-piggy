import type { ChildPatterns } from '@stoicpiggy/shared';

export type Lang = 'es' | 'en';

const dollars = (cents: number) => `$${Math.round(cents / 100)}`;

/**
 * Tier 1 coach: a data-driven opening line built from the kid's real numbers —
 * no model, works offline. The on-device LLM (Tier 2) is progressive enhancement
 * on top of this.
 */
export function coachReport(p: ChildPatterns | undefined, lang: Lang): string {
  if (!p || (p.inflowCents === 0 && p.spentCents === 0 && p.resistedCount === 0)) {
    return lang === 'es'
      ? 'Aún no veo movimientos este mes. Empieza guardando una parte de tu próxima mesada. 🐷'
      : "I don't see any activity yet this month. Start by saving part of your next allowance. 🐷";
  }
  const saved = `${p.saveRate}%`;
  const resisted = dollars(p.resistedCents);
  const praise =
    p.patienceScore >= 66
      ? lang === 'es'
        ? '¡Mucha paciencia! 🌟'
        : 'Lots of patience! 🌟'
      : p.patienceScore >= 33
        ? lang === 'es'
          ? 'Vas bien, sigue así. 💪'
          : "You're doing well — keep going. 💪"
        : lang === 'es'
          ? 'Respira antes de gastar. 🧘'
          : 'Breathe before you spend. 🧘';
  return lang === 'es'
    ? `Este mes guardaste el ${saved} de lo que recibiste y resististe ${resisted} en antojos (${p.resistedCount}). ${praise}`
    : `This month you kept ${saved} of what you got and resisted ${resisted} in impulse buys (${p.resistedCount}). ${praise}`;
}

/**
 * System prompt for the on-device LLM (Tier 2). Embeds the kid's numbers so the
 * model coaches from real data instead of generic advice.
 */
export function coachSystemPrompt(p: ChildPatterns | undefined, lang: Lang): string {
  const facts = p
    ? `This month: kept ${p.saveRate}% of money received, spent ${dollars(p.spentCents)}, resisted ${dollars(p.resistedCents)} of impulse buys (${p.resistedCount} times), patience score ${p.patienceScore}/100.`
    : 'No recent activity data.';
  const reply = lang === 'es' ? 'Spanish' : 'English';
  return [
    'You are Zen Piggy, a calm, encouraging money coach for a child (ages 7-14).',
    'Teach stoic patience and saving. Be warm, short (1-3 sentences), and concrete.',
    'Never shame the child. Never give financial product advice. Use their numbers when relevant.',
    `Always reply in ${reply}.`,
    facts,
    // Qwen3 soft switch: skip chain-of-thought so we get the answer directly
    // (faster on-device, and no English <think> block to leak into the chat).
    '/no_think',
  ].join(' ');
}

/**
 * Qwen3 emits its reasoning in a `<think>…</think>` block (in English, whatever
 * the answer language) — never show it to the kid. The reply is whatever follows
 * the block. An unclosed `<think>` means generation was cut off mid-reasoning, so
 * there's no answer to keep → return '' and let the caller fall back to Tier 1.
 */
export function stripThinking(text: string): string {
  const close = text.lastIndexOf('</think>');
  if (close !== -1)
    return text
      .slice(close + '</think>'.length)
      .replace(/<\/?think>/gi, '')
      .trim();
  return /<think>/i.test(text) ? '' : text.trim();
}
