import { type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SearchFieldInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function SearchFieldInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  className,
}: SearchFieldInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex items-center gap-3 space-y-0', className)}>
          <FormLabel className="shrink-0 whitespace-nowrap font-normal">{label}</FormLabel>
          <div className="min-w-0 flex-1">
            <FormControl>
              <Input placeholder={placeholder} disabled={disabled} {...field} />
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}

type SearchSelectOption = {
  label: React.ReactNode;
  value: string;
};

type SearchFieldSelectProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: SearchSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function SearchFieldSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  disabled,
  className,
}: SearchFieldSelectProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedOption = options.find((option) => option.value === field.value);

        return (
          <FormItem className={cn('flex items-center gap-3 space-y-0', className)}>
            <FormLabel className="shrink-0 whitespace-nowrap font-normal">{label}</FormLabel>
            <div className="min-w-0 flex-1">
              <Select
                disabled={disabled}
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    {selectedOption ? (
                      <span className="flex min-w-0 items-center truncate">
                        {selectedOption.label}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
