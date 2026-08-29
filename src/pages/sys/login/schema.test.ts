import { describe, expect, it } from 'vitest';

import { createLoginSchema } from './schema';

const t = (key: string) => key;

describe('createLoginSchema', () => {
  it('requires username and password', () => {
    const schema = createLoginSchema(t);
    const result = schema.safeParse({ username: '', password: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('username'))).toBe(true);
      expect(result.error.issues.some((issue) => issue.path.includes('password'))).toBe(true);
    }
  });

  it('accepts valid credentials', () => {
    const schema = createLoginSchema(t);
    const result = schema.safeParse({ username: 'admin', password: 'admin123' });

    expect(result.success).toBe(true);
  });
});
