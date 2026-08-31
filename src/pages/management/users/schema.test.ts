import { describe, expect, it } from 'vitest';

import { createUserCreateSchema, createUserEditSchema, createUserSearchSchema } from './schema';

const t = (key: string) => key;

describe('user schemas', () => {
  it('createUserCreateSchema requires core fields', () => {
    const schema = createUserCreateSchema(t);
    const result = schema.safeParse({ email: '', name: '', role_id: '' });

    expect(result.success).toBe(false);
  });

  it('createUserEditSchema accepts valid payload', () => {
    const schema = createUserEditSchema(t);
    const result = schema.safeParse({
      name: 'Admin',
      email: 'admin@example.com',
      default_language: 'pt_BR',
      is_active: true,
    });

    expect(result.success).toBe(true);
  });

  it('createUserSearchSchema allows optional filters', () => {
    const schema = createUserSearchSchema();
    const result = schema.safeParse({ name: 'admin' });

    expect(result.success).toBe(true);
  });
});
