import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiKey } from '#/domain';

import ApiKeysPage from './index';

const key = {
  id: 'api-key-production',
  name: 'Production integration',
  prefix: 'sk_live_7H2K…3X9P',
  scopes: ['customers:read', 'billing:read'],
  createdAt: '2026-02-01T10:00:00.000Z',
  lastUsedAt: '2026-09-30T10:30:00.000Z',
  expiresAt: '2027-02-01',
  revokedAt: null,
} satisfies ApiKey;
const mocks = vi.hoisted(() => ({
  getApiKeys: vi.fn(),
  createApiKey: vi.fn(),
  revokeApiKey: vi.fn(),
  permission: { canCreate: true, canDelete: true },
}));
vi.mock('@/api/services/domains/apiKeyService', () => ({ default: mocks }));
vi.mock('@/hooks/permissions/use-has-required-permission', () => ({
  useHasRequiredPermission: () => mocks.permission,
}));
vi.mock('@/router/hooks', () => ({
  useMatchRouteMeta: () => ({ label: 'app.menu.apiKeys' }),
}));

const renderPage = (route = '/workbench/platform/api-keys') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <ApiKeysPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );

describe('API keys page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mocks.permission, { canCreate: true, canDelete: true });
    mocks.getApiKeys.mockResolvedValue({
      data: [key],
      total_count: 1,
      page: 1,
      items_per_page: 10,
      has_more: false,
    });
    mocks.createApiKey.mockResolvedValue({ key, secret: 'sk_live_once_secret' });
    mocks.revokeApiKey.mockResolvedValue({ ...key, revokedAt: '2026-09-30T12:00:00.000Z' });
  });
  afterEach(cleanup);

  it('keeps the same key and revoke action in table, grid and list modes', async () => {
    const view = renderPage('/workbench/platform/api-keys?view=table&tenant=demo');
    expect(await screen.findByText('Production integration')).toBeInTheDocument();
    expect(view.container.querySelector('[data-view-mode="table"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Card grid view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="grid"]')).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: 'Revoke Production integration' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    await waitFor(() =>
      expect(view.container.querySelector('[data-view-mode="list"]')).toBeInTheDocument(),
    );
    expect(screen.getByText('Production integration')).toBeInTheDocument();
  });

  it('creates a key and exposes the complete secret only in the one-time dialog', async () => {
    renderPage();
    await screen.findByText('Production integration');
    fireEvent.click(screen.getByRole('button', { name: 'New API key' }));
    const dialog = await screen.findByRole('dialog', { name: 'New API key' });
    fireEvent.change(within(dialog).getByLabelText('Key name'), {
      target: { value: 'Warehouse sync' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(mocks.createApiKey).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Warehouse sync', scopes: ['customers:read'] }),
        expect.anything(),
      ),
    );
    expect(await screen.findByText('sk_live_once_secret')).toBeInTheDocument();
  });

  it('removes all mutation controls for a viewer while retaining the data view', async () => {
    Object.assign(mocks.permission, { canCreate: false, canDelete: false });
    renderPage();
    await screen.findByText('Production integration');
    expect(screen.queryByRole('button', { name: 'New API key' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Revoke Production integration' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Card grid view' })).toBeInTheDocument();
  });
});
