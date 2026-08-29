import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ConfirmDialog from './index';

describe('ConfirmDialog', () => {
  it('calls onConfirm when confirm is clicked', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        headerTitle="Delete item"
        title="Are you sure you want to delete this item?"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={onConfirm}
        trigger={<button type="button">Open</button>}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
