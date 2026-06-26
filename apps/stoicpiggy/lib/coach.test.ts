import type { ChildPatterns } from '@stoicpiggy/shared';
import { coachReport, stripThinking } from './coach';

const patterns: ChildPatterns = {
  windowDays: 30,
  inflowCents: 10000,
  spentCents: 4000,
  savedToGoalsCents: 0,
  saveRate: 60,
  resistedCount: 2,
  resistedCents: 6000,
  patienceScore: 60,
};

describe('coachReport', () => {
  it('summarizes real numbers when there is activity', () => {
    const msg = coachReport(patterns, 'en');
    expect(msg).toContain('60%');
    expect(msg).toContain('$60');
    expect(msg).toContain('2');
  });

  it('nudges a first-timer when there is no activity', () => {
    const empty = {
      ...patterns,
      inflowCents: 0,
      spentCents: 0,
      resistedCount: 0,
      resistedCents: 0,
    };
    expect(coachReport(empty, 'es')).toMatch(/mesada/i);
  });

  it('treats spending from a prior balance as activity (not a first-timer)', () => {
    const spentOnly = { ...patterns, inflowCents: 0, resistedCount: 0, resistedCents: 0 };
    expect(coachReport(spentOnly, 'es')).not.toMatch(/mesada/i);
  });
});

describe('stripThinking', () => {
  it('keeps only the answer after a Qwen3 <think> block', () => {
    expect(stripThinking('<think>\nThe user asks how to save.\n</think>\nAhorra una parte. 🐷')).toBe(
      'Ahorra una parte. 🐷',
    );
  });

  it('passes through a plain answer (no reasoning emitted)', () => {
    expect(stripThinking('Respira antes de gastar. 🧘')).toBe('Respira antes de gastar. 🧘');
  });

  it('drops a truncated, unclosed reasoning block (no answer to keep)', () => {
    expect(stripThinking('<think>\nOkay, the user is asking how to start sav')).toBe('');
  });
});
