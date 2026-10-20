import { z } from 'zod';

export function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().min(1, t('sys.login.emailRequired')),
    password: z.string().min(1, t('sys.login.passwordRequired')),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
