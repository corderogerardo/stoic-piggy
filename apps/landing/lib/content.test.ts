import { describe, expect, it } from 'vitest';
import { CONTENT } from './content';

describe('landing content', () => {
  it('no longer ships any pricing section or nav link', () => {
    for (const lang of ['es', 'en'] as const) {
      expect('price' in CONTENT[lang]).toBe(false);
      expect('pricing' in CONTENT[lang].nav).toBe(false);
    }
  });

  it('communicates free access with unlimited kids', () => {
    expect(JSON.stringify(CONTENT.es).toLowerCase()).toContain('ilimitad');
    expect(JSON.stringify(CONTENT.en).toLowerCase()).toContain('unlimited');
  });

  it('keeps a FAQ that answers cost', () => {
    expect(CONTENT.es.faq.items.some((f) => f.q.toLowerCase().includes('cuesta'))).toBe(true);
    expect(CONTENT.en.faq.items.some((f) => f.q.toLowerCase().includes('cost'))).toBe(true);
  });
});
