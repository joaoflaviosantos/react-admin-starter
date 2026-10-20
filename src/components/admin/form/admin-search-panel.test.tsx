import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AdminSearchPanel } from './admin-search-panel';

describe('AdminSearchPanel', () => {
  it('reserves three field slots when only one filter is provided', () => {
    const { container } = render(
      <AdminSearchPanel onClear={vi.fn()}>
        <label>
          Search
          <input />
        </label>
      </AdminSearchPanel>,
    );

    const slots = Array.from(container.firstElementChild?.children ?? []);
    expect(slots).toHaveLength(4);
    expect(slots[0]).toContainElement(screen.getByLabelText('Search'));
    expect(slots[1]).toHaveAttribute('aria-hidden', 'true');
    expect(slots[2]).toHaveAttribute('aria-hidden', 'true');
    expect(slots[3]).toContainElement(screen.getByRole('button', { name: 'Clear' }));
  });

  it('limits the panel to the three primary filters', () => {
    render(
      <AdminSearchPanel onClear={vi.fn()}>
        <label>
          First
          <input />
        </label>
        <label>
          Second
          <input />
        </label>
        <label>
          Third
          <input />
        </label>
        <label>
          Fourth
          <input />
        </label>
      </AdminSearchPanel>,
    );

    expect(screen.getByLabelText('First')).toBeInTheDocument();
    expect(screen.getByLabelText('Second')).toBeInTheDocument();
    expect(screen.getByLabelText('Third')).toBeInTheDocument();
    expect(screen.queryByLabelText('Fourth')).not.toBeInTheDocument();
  });
});
