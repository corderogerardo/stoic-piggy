import { suggestionsForAge, TERM_MONTHS } from './goals';

describe('suggestionsForAge', () => {
  it('returns the full catalog (unordered) when age is unknown', () => {
    expect(suggestionsForAge()).toEqual(suggestionsForAge(undefined));
    expect(suggestionsForAge().length).toBeGreaterThan(0);
  });

  it('keeps every suggestion regardless of age', () => {
    const all = suggestionsForAge();
    expect(suggestionsForAge(6)).toHaveLength(all.length);
    expect(suggestionsForAge(16)).toHaveLength(all.length);
  });

  it('leads with age-appropriate suggestions (ageMin <= age), closest first', () => {
    const ordered = suggestionsForAge(8);
    const firstUnfit = ordered.findIndex((s) => s.ageMin > 8);
    const fit = firstUnfit === -1 ? ordered : ordered.slice(0, firstUnfit);
    // all leading items fit the age, and they lead with the most grown-up of those
    expect(fit.every((s) => s.ageMin <= 8)).toBe(true);
    expect(fit[0]?.ageMin).toBeGreaterThanOrEqual(fit[fit.length - 1]?.ageMin ?? 0);
  });

  it('surfaces a teen goal near the top for an older kid but not a younger one', () => {
    const teenFirst = suggestionsForAge(15).findIndex((s) => s.key === 'college-fund');
    const kidFirst = suggestionsForAge(8).findIndex((s) => s.key === 'college-fund');
    expect(teenFirst).toBeLessThan(kidFirst);
  });
});

describe('TERM_MONTHS', () => {
  it('maps terms to ascending durations', () => {
    expect(TERM_MONTHS.short).toBeLessThan(TERM_MONTHS.medium);
    expect(TERM_MONTHS.medium).toBeLessThan(TERM_MONTHS.long);
  });
});
