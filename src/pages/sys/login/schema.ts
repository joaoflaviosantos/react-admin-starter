import { z } from 'zod';

export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    username: z.string().min(1, t('sys.login.usernameRequired')),
    password: z.string().min(1, t('sys.login.passwordRequired')),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
