import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminNavMenu, type AdminMenuItem } from '@/components/admin/sidebar-nav';

const menuItems: AdminMenuItem[] = [
  {
    key: '/management',
    label: 'Gerenciamento',
    icon: <span aria-hidden>MG</span>,
    children: [
      {
        key: '/management/users',
        label: 'Usuários',
        icon: <span aria-hidden>US</span>,
      },
      {
        key: '/management/roles',
        label: 'Funções',
      },
    ],
  },
];

describe('AdminNavMenu collapsed', () => {
  afterEach(() => {
    cleanup();
  });

  it('opens dropdown on hover when sidebar is collapsed', async () => {
    const user = userEvent.setup();

    render(
      <AdminNavMenu
        items={menuItems}
        selectedKey="/management/users"
        openKeys={[]}
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
        collapsed
      />,
    );

    const nav = screen.getByRole('navigation');
    await user.hover(within(nav).getByRole('button', { name: 'Gerenciamento' }));

    expect(await screen.findByRole('menuitem', { name: 'Usuários' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Funções' })).toBeInTheDocument();
  });

  it('selects item from collapsed dropdown', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AdminNavMenu
        items={menuItems}
        selectedKey="/"
        openKeys={[]}
        onOpenChange={vi.fn()}
        onSelect={onSelect}
        collapsed
      />,
    );

    const nav = screen.getByRole('navigation');
    await user.click(within(nav).getByRole('button', { name: 'Gerenciamento' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Usuários' }));

    expect(onSelect).toHaveBeenCalledWith('/management/users');
  });
});
