import { z } from 'zod';

export function createRoleSearchSchema() {
  return z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    is_active: z.string().optional(),
  });
}

export type RoleSearchFormValues = z.infer<ReturnType<typeof createRoleSearchSchema>>;
