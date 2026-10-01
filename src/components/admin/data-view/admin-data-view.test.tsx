import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminDataView } from './admin-data-view';
import type { AdminDataViewMode } from './use-data-view-mode';

type Item = { id: string; name: string };

const items: Item[] = [
  { id: 'customer-1', name: 'Acme' },
  { id: 'customer-2', name: 'Globex' },
];

function LocationProbe() {
  return <output data-testid="location">{useLocation().search}</output>;
}

function matchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 767px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function DataViewFixture({
  isLoading = false,
  error,
  data = items,
  onAction = vi.fn(),
}: {
  isLoading?: boolean;
  error?: unknown;
  data?: Item[];
  onAction?: (id: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState(['customer-2']);
  const action = (item: Item) => (
    <button type="button" onClick={() => onAction(item.id)}>
      Open {item.name}
    </button>
  );

  return (
    <AdminDataView
      data={data}
      getItemId={(item) => item.id}
      selectedIds={selectedIds}
      onSelectedIdsChange={setSelectedIds}
      renderActions={action}
      renderTable={({ data: rows, selectedIds: selected, renderActions }) => (
        <div data-testid="table-data">
          {rows.map((item) => (
            <article key={item.id} data-selected={selected.includes(item.id)}>
              {item.id}
              {renderActions?.(item)}
            </article>
          ))}
        </div>
      )}
      renderGridItem={(item, context) => (
        <article data-testid="grid-item" data-selected={context.isSelected}>
          {item.id}
          {context.actions}
        </article>
      )}
      renderListItem={(item, context) => (
        <article data-testid="list-item" data-selected={context.isSelected}>
          {item.id}
          {context.actions}
        </article>
      )}
      isLoading={isLoading}
      error={error}
      labels={{
        table: 'Table view',
        grid: 'Card grid view',
        list: 'List view',
        loading: 'Loading customers',
        empty: 'No customers found',
        error: 'Unable to load customers',
      }}
    />
  );
}

function renderView(entry = '/?search=acme&page=2', fixture = <DataViewFixture />) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      {fixture}
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('AdminDataView', () => {
  beforeEach(() => matchMedia(false));
  afterEach(cleanup);

  it('offers accessible pressed-state controls and preserves search params when view changes', async () => {
    const user = userEvent.setup();
    renderView();

    expect(screen.getByRole('button', { name: 'Table view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Card grid view' }));

    expect(screen.getByRole('button', { name: 'Card grid view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('location')).toHaveTextContent('?search=acme&page=2&view=grid');
  });

  it.each([
    ['desktop', false, 'table'],
    ['mobile', true, 'list'],
  ] as const)('normalizes missing and invalid view to the %s default', (_, mobile, expected) => {
    matchMedia(mobile);
    renderView('/?view=unknown');

    expect(
      screen.getByRole('button', { name: `${expected === 'table' ? 'Table' : 'List'} view` }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('feeds identical IDs, selection and action payloads to table, grid and list', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    renderView('/?view=table', <DataViewFixture onAction={onAction} />);

    expect(screen.getByTestId('table-data')).toHaveTextContent('customer-1');
    expect(screen.getByTestId('table-data')).toHaveTextContent('customer-2');
    expect(screen.getByText('customer-2').closest('article')).toHaveAttribute(
      'data-selected',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Open Acme' }));

    await user.click(screen.getByRole('button', { name: 'Card grid view' }));
    expect(screen.getAllByTestId('grid-item').map((node) => node.textContent)).toEqual([
      'customer-1Open Acme',
      'customer-2Open Globex',
    ]);
    expect(screen.getAllByTestId('grid-item')[1]).toHaveAttribute('data-selected', 'true');
    await user.click(screen.getByRole('button', { name: 'Open Acme' }));

    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getAllByTestId('list-item').map((node) => node.textContent)).toEqual([
      'customer-1Open Acme',
      'customer-2Open Globex',
    ]);
    expect(screen.getAllByTestId('list-item')[1]).toHaveAttribute('data-selected', 'true');
    await user.click(screen.getByRole('button', { name: 'Open Acme' }));

    expect(onAction).toHaveBeenNthCalledWith(1, 'customer-1');
    expect(onAction).toHaveBeenNthCalledWith(2, 'customer-1');
    expect(onAction).toHaveBeenNthCalledWith(3, 'customer-1');
  });

  it.each([
    ['loading', <DataViewFixture isLoading />, 'status', 'Loading customers'],
    ['empty', <DataViewFixture data={[]} />, 'status', 'No customers found'],
    [
      'error',
      <DataViewFixture error={new Error('network')} />,
      'alert',
      'Unable to load customers',
    ],
  ])('renders the localized %s state independently of view', (_, fixture, role, message) => {
    renderView('/?view=grid', fixture);
    expect(screen.getByRole(role, { name: message })).toHaveTextContent(message);
  });
});

describe('AdminDataViewMode type', () => {
  it('accepts only the three specified display modes', () => {
    const modes: AdminDataViewMode[] = ['table', 'grid', 'list'];
    expect(modes).toEqual(['table', 'grid', 'list']);
  });
});
