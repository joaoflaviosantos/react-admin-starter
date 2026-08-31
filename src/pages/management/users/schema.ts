import { z } from 'zod';

export function createUserCreateSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().min(1, t('common.requiredField')).email(t('common.invalidEmail')),
    name: z.string().min(1, t('common.requiredField')),
    role_id: z.string().min(1, t('common.requiredField')),
    password: z.string().optional(),
  });
}

export type UserCreateFormValues = z.infer<ReturnType<typeof createUserCreateSchema>>;

export function createUserEditSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('common.requiredField')),
    email: z.string().min(1, t('common.requiredField')).email(t('common.invalidEmail')),
    default_language: z.string().min(1, t('common.requiredField')),
    is_active: z.boolean(),
  });
}

export type UserEditFormValues = z.infer<ReturnType<typeof createUserEditSchema>>;

export function createUserSearchSchema() {
  return z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    is_active: z.string().optional(),
  });
}

export type UserSearchFormValues = z.infer<ReturnType<typeof createUserSearchSchema>>;
