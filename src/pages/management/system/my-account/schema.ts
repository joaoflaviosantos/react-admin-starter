import { z } from 'zod';

export function createPersonalInfoSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(2, t('management.myAccount.personalInfo.validation.nameMinLength')),
    email: z.string().email(t('management.myAccount.personalInfo.validation.emailInvalid')),
    default_language: z
      .string()
      .min(1, t('management.myAccount.personalInfo.validation.languageRequired')),
  });
}

export function createSecuritySchema(t: (key: string) => string) {
  return z
    .object({
      currentPassword: z
        .string()
        .min(1, t('management.myAccount.security.validation.currentPasswordRequired')),
      newPassword: z
        .string()
        .min(8, t('management.myAccount.security.validation.newPasswordMinLength'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t('management.myAccount.security.validation.newPasswordPattern'),
        ),
      confirmPassword: z
        .string()
        .min(1, t('management.myAccount.security.validation.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('management.myAccount.security.validation.passwordsNotMatch'),
      path: ['confirmPassword'],
    });
}

export type PersonalInfoValues = z.infer<ReturnType<typeof createPersonalInfoSchema>>;
export type SecurityValues = z.infer<ReturnType<typeof createSecuritySchema>>;
