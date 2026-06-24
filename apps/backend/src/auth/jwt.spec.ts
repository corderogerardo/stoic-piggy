import { signToken, verifyToken } from './jwt';

const SECRET = 'test-secret';

describe('jwt', () => {
  it('round-trips parent claims', () => {
    const token = signToken({ sub: 'p1', role: 'parent' }, SECRET);
    const claims = verifyToken(token, SECRET);
    expect(claims).toEqual({ sub: 'p1', role: 'parent', parentId: undefined });
  });

  it('round-trips child claims including parentId', () => {
    const token = signToken({ sub: 'c1', role: 'child', parentId: 'p1' }, SECRET);
    expect(verifyToken(token, SECRET)).toEqual({ sub: 'c1', role: 'child', parentId: 'p1' });
  });

  it('rejects a token signed with a different secret', () => {
    const token = signToken({ sub: 'p1', role: 'parent' }, SECRET);
    expect(verifyToken(token, 'other-secret')).toBeNull();
  });

  it('rejects garbage and expired tokens', () => {
    expect(verifyToken('not.a.token', SECRET)).toBeNull();
    const expired = signToken({ sub: 'p1', role: 'parent' }, SECRET, '-1s');
    expect(verifyToken(expired, SECRET)).toBeNull();
  });
});
