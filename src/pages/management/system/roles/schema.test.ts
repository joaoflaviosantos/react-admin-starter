import { describe, expect, it } from 'vitest';

import { normalizeCrudSearchValues } from '@/lib/crud-search';

import { createRoleSearchSchema } from './schema';

describe('createRoleSearchSchema', () => {
  it('allows optional filters', () => {
    const schema = createRoleSearchSchema();
    const result = schema.safeParse({ name: 'admin' });

    expect(result.success).toBe(true);
  });
});

describe('normalizeCrudSearchValues', () => {
  it('converts is_active string to boolean', () => {
    expect(normalizeCrudSearchValues({ is_active: 'true', name: '' })).toEqual({
      is_active: true,
    });
  });
});
