import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type ColumnDef } from '@tanstack/react-table';

import { AdminTable } from './admin-table';

type Row = { id: string; name: string };

const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }];

describe('AdminTable', () => {
  it('renders empty state when no data', () => {
    render(<AdminTable columns={columns} data={[]} rowKey="id" emptyMessage="No rows" />);

    expect(screen.getByText('No rows')).toBeInTheDocument();
  });

  it('calls onPaginationChange when page changes', async () => {
    const onPaginationChange = vi.fn();
    const user = userEvent.setup();
    const data = Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      name: `User ${i + 1}`,
    }));

    render(
      <AdminTable
        columns={columns}
        data={data}
        rowKey="id"
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalCount: 25,
          onPaginationChange,
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: '2' }));

    expect(onPaginationChange).toHaveBeenCalledWith(2, 10);
  });
});
