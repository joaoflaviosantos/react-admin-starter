import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sheet, SheetContent } from '@/components/ui/sheet';

describe('SheetContent', () => {
  it('hides the close button when requested', () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>Sidebar content</SheetContent>
      </Sheet>,
    );

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('shows the close button by default', () => {
    render(
      <Sheet open>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
