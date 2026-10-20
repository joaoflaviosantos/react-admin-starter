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

const nestedMenuItems: AdminMenuItem[] = [
  {
    key: '/workbench',
    label: 'Workbench',
    children: [
      {
        key: '/workbench/operations',
        label: 'Operações',
        children: [
          { key: '/workbench/operations/subscriptions', label: 'Assinaturas' },
          { key: '/workbench/operations/invoices', label: 'Faturas' },
        ],
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

describe('AdminNavMenu nested catalogues', () => {
  afterEach(() => {
    cleanup();
  });

  it('opens and selects a third-level item in the vertical drawer without selecting catalogues', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AdminNavMenu
        items={nestedMenuItems}
        selectedKey="/workbench/operations/invoices"
        openKeys={['/workbench', '/workbench/operations']}
        onOpenChange={vi.fn()}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole('button', { name: 'Workbench' })).toHaveClass('text-primary');
    expect(screen.getByRole('button', { name: 'Operações' })).toHaveClass('text-primary');

    await user.click(screen.getByRole('button', { name: 'Faturas' }));

    expect(onSelect).toHaveBeenCalledWith('/workbench/operations/invoices');
    expect(onSelect).not.toHaveBeenCalledWith('/workbench');
    expect(onSelect).not.toHaveBeenCalledWith('/workbench/operations');
  });

  it('opens a third-level item from the mini hover menu', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AdminNavMenu
        items={nestedMenuItems}
        selectedKey="/workbench/operations/invoices"
        openKeys={[]}
        onOpenChange={vi.fn()}
        onSelect={onSelect}
        collapsed
      />,
    );

    await user.hover(screen.getByRole('button', { name: 'Workbench' }));
    await user.hover(await screen.findByRole('menuitem', { name: 'Operações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Faturas' }));

    expect(onSelect).toHaveBeenCalledWith('/workbench/operations/invoices');
  });

  it('opens and selects a third-level item from the horizontal hover menu', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <AdminNavMenu
        items={nestedMenuItems}
        selectedKey="/workbench/operations/invoices"
        openKeys={[]}
        onOpenChange={vi.fn()}
        onSelect={onSelect}
        mode="horizontal"
      />,
    );

    await user.hover(screen.getByRole('button', { name: 'Workbench' }));
    await user.hover(await screen.findByRole('menuitem', { name: 'Operações' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Faturas' }));

    expect(onSelect).toHaveBeenCalledWith('/workbench/operations/invoices');
  });
});
