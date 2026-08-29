import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form';

import { Form } from '@/components/ui/form';

type AdminFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export function AdminForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: AdminFormProps<T>) {
  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
          {children}
        </form>
      </Form>
    </FormProvider>
  );
}
