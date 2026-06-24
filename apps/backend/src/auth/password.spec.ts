import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('hashes to a non-plaintext bcrypt string', async () => {
    const hash = await hashPassword('piggy1234');
    expect(hash).not.toBe('piggy1234');
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('verifies a correct password', async () => {
    const hash = await hashPassword('piggy1234');
    expect(await verifyPassword('piggy1234', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('piggy1234');
    expect(await verifyPassword('nope', hash)).toBe(false);
  });

  it('returns false (never throws) for an empty/invalid hash', async () => {
    expect(await verifyPassword('anything', '')).toBe(false);
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
  });
});
