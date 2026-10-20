import { describe, expect, it } from 'vitest';

import { mockError, paginate, readPagination, readRequestBody } from './shared';

describe('Domain mock helpers', () => {
  it('normalizes pagination to positive page and page size values', () => {
    expect(paginate(['a', 'b', 'c'], 0, 0)).toEqual({
      data: ['a'],
      total_count: 3,
      has_more: true,
      page: 1,
      items_per_page: 1,
    });
    expect(
      readPagination({ params: { page: '2.8', items_per_page: 'not-a-number' } } as never),
    ).toEqual({ page: 2, itemsPerPage: 10 });
  });

  it('reads JSON and urlencoded request bodies without leaking transport details to domain handlers', () => {
    expect(readRequestBody('{"title":"Example"}')).toEqual({ title: 'Example' });
    expect(readRequestBody('title=Example+task')).toEqual({ title: 'Example task' });
  });

  it('uses the same detail error envelope for every shared error status', () => {
    expect(mockError(401, 'User not authenticated.')).toEqual({
      status: 401,
      data: { detail: 'User not authenticated.' },
    });
    expect(mockError(403, 'Insufficient permissions.').data).toEqual({
      detail: 'Insufficient permissions.',
    });
    expect(mockError(404, 'Not found.').data).toEqual({ detail: 'Not found.' });
    expect(mockError(405, 'Method not allowed.')).toEqual({
      status: 405,
      data: { detail: 'Method not allowed.' },
    });
    expect(mockError(422, 'Invalid payload.').data).toEqual({ detail: 'Invalid payload.' });
  });
});
