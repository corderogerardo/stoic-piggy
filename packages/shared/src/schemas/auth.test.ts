import { describe, expect, it } from 'vitest';
import {
  createChildAccountSchema,
  loginChildSchema,
  passwordSchema,
  registerParentSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  usernameSchema,
  verifyEmailSchema,
} from './index';

describe('usernameSchema', () => {
  it('lowercases and trims', () => {
    expect(usernameSchema.parse('  Marco  ')).toBe('marco');
  });

  it('rejects too-short and invalid characters', () => {
    expect(usernameSchema.safeParse('ab').success).toBe(false);
    expect(usernameSchema.safeParse('has space').success).toBe(false);
    expect(usernameSchema.safeParse('emoji😀').success).toBe(false);
  });

  it('accepts letters, numbers and _ . -', () => {
    expect(usernameSchema.safeParse('marco_99.x-y').success).toBe(true);
  });
});

describe('passwordSchema', () => {
  it('requires at least 8 characters', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false);
    expect(passwordSchema.safeParse('longenough').success).toBe(true);
  });
});

describe('registerParentSchema', () => {
  it('normalizes the email and enforces a strong password', () => {
    const parsed = registerParentSchema.parse({
      email: '  PARENT@X.DEV ',
      password: 'password123',
      displayName: '  Pat ',
    });
    expect(parsed.email).toBe('parent@x.dev');
    expect(parsed.displayName).toBe('Pat');
  });

  it('rejects a bad email or weak password', () => {
    expect(
      registerParentSchema.safeParse({ email: 'nope', password: 'password123', displayName: 'X' })
        .success,
    ).toBe(false);
    expect(
      registerParentSchema.safeParse({ email: 'a@b.dev', password: 'short', displayName: 'X' })
        .success,
    ).toBe(false);
  });
});

describe('verifyEmailSchema', () => {
  it('requires a non-empty token', () => {
    expect(verifyEmailSchema.safeParse({ token: '' }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ token: 'abc' }).success).toBe(true);
  });
});

describe('requestPasswordResetSchema', () => {
  it('normalizes the email and rejects bad ones', () => {
    expect(requestPasswordResetSchema.parse({ email: ' PARENT@X.DEV ' }).email).toBe(
      'parent@x.dev',
    );
    expect(requestPasswordResetSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('requires a token and a strong password', () => {
    expect(resetPasswordSchema.safeParse({ token: 't', password: 'password123' }).success).toBe(
      true,
    );
    expect(resetPasswordSchema.safeParse({ token: '', password: 'password123' }).success).toBe(
      false,
    );
    expect(resetPasswordSchema.safeParse({ token: 't', password: 'short' }).success).toBe(false);
  });
});

describe('loginChildSchema', () => {
  it('normalizes username and accepts any non-empty password', () => {
    const parsed = loginChildSchema.parse({ username: 'MARCO', password: 'x' });
    expect(parsed.username).toBe('marco');
  });
});

describe('createChildAccountSchema', () => {
  it('accepts a valid account with optional age', () => {
    expect(
      createChildAccountSchema.safeParse({
        displayName: 'Nina',
        username: 'nina',
        password: 'password123',
        age: 9,
      }).success,
    ).toBe(true);
  });

  it('rejects out-of-range ages', () => {
    expect(
      createChildAccountSchema.safeParse({
        displayName: 'Nina',
        username: 'nina',
        password: 'password123',
        age: 0,
      }).success,
    ).toBe(false);
  });
});
