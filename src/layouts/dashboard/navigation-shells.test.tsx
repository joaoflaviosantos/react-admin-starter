import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Nav from './nav';
import NavHorizontal from './nav-horizontal';

import { ThemeLayout, ThemeMode } from '#/enum';

const mocks = vi.hoisted(() => ({
  layout: 'vertical',
  navigate: vi.fn(),
  closeDrawer: vi.fn(),
  navProps: vi.fn(),
  matches: [
    { pathname: '/examples' },
    { pathname: '/examples/revenue' },
    { pathname: '/examples/revenue/invoices' },
  ],
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
  useMatches: () => mocks.matches,
  useLocation: () => ({ pathname: '/examples/revenue/invoices' }),
}));
vi.mock('@/components/admin/sidebar-nav', () => ({
  AdminNavMenu: (props: Record<string, unknown>) => {
    mocks.navProps(props);
    return (
      <button
        onClick={() => (props.onSelect as (key: string) => void)('/examples/revenue/invoices')}
      >
        Select invoices
      </button>
    );
  },
}));
vi.mock('@/components/icon', () => ({ Iconify: () => null }));
vi.mock('@/components/logo', () => ({ default: () => <span>Logo</span> }));
vi.mock('@/components/scrollbar', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/router/hooks', () => ({
  useFlattenedRoutes: () => [{ key: '/examples/revenue/invoices' }],
  usePermissionRoutes: () => [],
  useRouteToMenuFn: () => () => [{ key: '/examples', label: 'Examples' }],
}));
vi.mock('@/store/settingStore', () => ({
  useSettings: () => ({
    themeLayout: mocks.layout,
    themeMode: ThemeMode.Light,
  }),
  useSettingActions: () => ({ setSettings: vi.fn() }),
}));
vi.mock('@/theme/hooks', () => ({ useTheme: () => ({ colorPrimary: '#000' }) }));

describe('Examples navigation shells', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.layout = ThemeLayout.Vertical;
  });
  afterEach(cleanup);

  it('renders the desktop vertical shell expanded with the deep leaf selected', () => {
    render(<Nav />);
    expect(mocks.navProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedKey: '/examples/revenue/invoices',
        collapsed: false,
      }),
    );
  });

  it('renders the mini shell collapsed with the deep leaf selected', () => {
    mocks.layout = ThemeLayout.Mini;
    render(<Nav />);
    expect(mocks.navProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedKey: '/examples/revenue/invoices',
        collapsed: true,
      }),
    );
  });

  it('renders the mobile drawer expanded and closes it after deep-leaf navigation', () => {
    mocks.layout = ThemeLayout.Mini;
    render(<Nav closeSideBarDrawer={mocks.closeDrawer} />);
    expect(mocks.navProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedKey: '/examples/revenue/invoices',
        collapsed: false,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select invoices' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/examples/revenue/invoices');
    expect(mocks.closeDrawer).toHaveBeenCalledTimes(1);
  });

  it('renders the horizontal shell with the deep leaf selected', () => {
    render(<NavHorizontal />);
    expect(mocks.navProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        selectedKey: '/examples/revenue/invoices',
        mode: 'horizontal',
      }),
    );
  });
});
