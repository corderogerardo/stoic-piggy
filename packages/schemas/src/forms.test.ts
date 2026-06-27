import { describe, expect, it } from 'vitest';
import {
  allowanceFormSchema,
  createGoalFormSchema,
  createKidFormSchema,
  createTaskFormSchema,
  editKidFormSchema,
  resetPasswordFormSchema,
  temptationFormSchema,
} from './forms';

describe('createGoalFormSchema', () => {
  it('coerces a digit target string and trims the title', () => {
    const parsed = createGoalFormSchema.parse({
      title: '  New bike  ',
      dollars: '150',
      term: 'medium',
      category: 'thing',
    });
    expect(parsed.title).toBe('New bike');
    expect(parsed.dollars).toBe(150);
  });

  it('rejects an empty title, a non-positive target, and a bad term/category', () => {
    expect(
      createGoalFormSchema.safeParse({ title: '', dollars: '10', term: 'short', category: 'thing' })
        .success,
    ).toBe(false);
    expect(
      createGoalFormSchema.safeParse({ title: 'x', dollars: '0', term: 'short', category: 'thing' })
        .success,
    ).toBe(false);
    expect(
      createGoalFormSchema.safeParse({ title: 'x', dollars: '10', term: 'soon', category: 'thing' })
        .success,
    ).toBe(false);
    expect(
      createGoalFormSchema.safeParse({
        title: 'x',
        dollars: '10',
        term: 'short',
        category: 'crypto',
      }).success,
    ).toBe(false);
  });
});

describe('resetPasswordFormSchema', () => {
  it('enforces the shared password rules', () => {
    expect(resetPasswordFormSchema.safeParse({ password: 'short' }).success).toBe(false);
    expect(resetPasswordFormSchema.safeParse({ password: 'password123' }).success).toBe(true);
  });
});

describe('createKidFormSchema', () => {
  it("coerces an empty age string to 'no age' and a digit string to a number", () => {
    const blank = createKidFormSchema.parse({
      displayName: 'Nina',
      username: 'Nina',
      password: 'password123',
      age: '',
    });
    expect(blank.age).toBeUndefined();
    expect(blank.username).toBe('nina'); // username rule still normalizes

    const withAge = createKidFormSchema.parse({
      displayName: 'Nina',
      username: 'nina',
      password: 'password123',
      age: '9',
    });
    expect(withAge.age).toBe(9);
  });

  it('rejects an out-of-range age and a weak password', () => {
    expect(
      createKidFormSchema.safeParse({
        displayName: 'Nina',
        username: 'nina',
        password: 'password123',
        age: '99',
      }).success,
    ).toBe(false);
    expect(
      createKidFormSchema.safeParse({
        displayName: 'Nina',
        username: 'nina',
        password: 'short',
        age: '',
      }).success,
    ).toBe(false);
  });
});

describe('editKidFormSchema', () => {
  it('clears age with an empty string (-> null) and requires a name', () => {
    expect(editKidFormSchema.parse({ displayName: 'Nina', age: '' }).age).toBeNull();
    expect(editKidFormSchema.parse({ displayName: 'Nina', age: '12' }).age).toBe(12);
    expect(editKidFormSchema.safeParse({ displayName: '   ', age: '' }).success).toBe(false);
  });
});

describe('allowanceFormSchema', () => {
  it('coerces dollar strings and floors empty at 0', () => {
    expect(allowanceFormSchema.parse({ dollars: '', autopayEnabled: false }).dollars).toBe(0);
    expect(allowanceFormSchema.parse({ dollars: '25', autopayEnabled: true }).dollars).toBe(25);
    expect(
      allowanceFormSchema.safeParse({ dollars: '999999', autopayEnabled: false }).success,
    ).toBe(false);
  });
});

describe('createTaskFormSchema', () => {
  it('requires at least one child and coerces amount/xp', () => {
    expect(
      createTaskFormSchema.safeParse({
        childIds: [],
        title: 'Dishes',
        category: 'chore',
        payType: 'money',
        amount: '20',
        xp: '0',
        recurrence: 'once',
      }).success,
    ).toBe(false);

    const ok = createTaskFormSchema.parse({
      childIds: ['c1', 'c2'],
      title: '',
      category: 'chore',
      payType: 'both',
      amount: '20',
      xp: '50',
      recurrence: 'weekly',
    });
    expect(ok.amount).toBe(20);
    expect(ok.xp).toBe(50);
    expect(ok.title).toBe(''); // optional — the screen supplies a default

    // No form-level cap: a value above the server cap is accepted here so a
    // value left in the hidden pay side can never silently block submit.
    expect(
      createTaskFormSchema.safeParse({
        childIds: ['c1'],
        title: 't',
        category: 'chore',
        payType: 'xp',
        amount: '999999',
        xp: '50',
        recurrence: 'once',
      }).success,
    ).toBe(true);
  });
});

describe('temptationFormSchema', () => {
  it('requires a positive price and allows an empty item', () => {
    expect(temptationFormSchema.safeParse({ item: '', amount: '' }).success).toBe(false);
    expect(temptationFormSchema.safeParse({ item: '', amount: '0' }).success).toBe(false);
    const ok = temptationFormSchema.parse({ item: '  Toy  ', amount: '15' });
    expect(ok.amount).toBe(15);
    expect(ok.item).toBe('Toy');
  });
});
