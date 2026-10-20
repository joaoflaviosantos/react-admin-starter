import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NativeChart } from './native-chart';

const chart = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('echarts', () => ({
  init: vi.fn(() => chart),
}));

describe('NativeChart', () => {
  let resizeCallback: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    resizeCallback = undefined;
    class ResizeObserverMock {
      constructor(callback: () => void) {
        resizeCallback = callback;
      }

      observe = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
  });

  it('initializes with options and disposes the instance and observer', async () => {
    const { unmount } = render(
      <NativeChart title="Revenue" option={{ series: [{ type: 'bar', data: [1] }] }} />,
    );
    await waitFor(() =>
      expect(chart.setOption).toHaveBeenCalledWith(
        { backgroundColor: 'transparent', series: [{ type: 'bar', data: [1] }] },
        { notMerge: true },
      ),
    );
    resizeCallback?.();
    expect(chart.resize).toHaveBeenCalledTimes(1);

    unmount();
    expect(chart.dispose).toHaveBeenCalledTimes(1);
  });

  it('exposes accessible local loading, empty and error states without chart listeners', () => {
    const { rerender, getByRole } = render(
      <NativeChart title="Revenue" option={{}} state="loading" stateMessage="Loading revenue" />,
    );
    expect(getByRole('status')).toHaveTextContent('Loading revenue');
    rerender(<NativeChart title="Revenue" option={{}} state="empty" stateMessage="No revenue" />);
    expect(getByRole('status')).toHaveTextContent('No revenue');
    rerender(
      <NativeChart title="Revenue" option={{}} state="error" stateMessage="Revenue failed" />,
    );
    expect(getByRole('status')).toHaveTextContent('Revenue failed');
  });
});
