import { cleanup, render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

afterEach(() => {
  cleanup();
});

function InputTestForm() {
  const form = useForm({ defaultValues: { username: '' } });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input placeholder="Enter username" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  );
}

function SelectTestForm() {
  const form = useForm({ defaultValues: { role: '' } });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </Form>
  );
}

describe('FormControl', () => {
  it('merges aria props onto input without passing children to void elements', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<InputTestForm />);

    const input = screen.getByPlaceholderText('Enter username');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('id');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('aria-invalid', 'false');

    const voidElementWarnings = consoleError.mock.calls.filter(([message]) =>
      String(message).includes('void element tag'),
    );
    expect(voidElementWarnings).toHaveLength(0);

    consoleError.mockRestore();
  });

  it('merges aria props onto SelectTrigger without passing children to void elements', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SelectTestForm />);

    const trigger = screen.getByLabelText('Role');

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('id');
    expect(trigger).toHaveAttribute('aria-describedby');
    expect(trigger).toHaveAttribute('aria-invalid', 'false');

    const voidElementWarnings = consoleError.mock.calls.filter(([message]) =>
      String(message).includes('void element tag'),
    );
    expect(voidElementWarnings).toHaveLength(0);

    consoleError.mockRestore();
  });
});
