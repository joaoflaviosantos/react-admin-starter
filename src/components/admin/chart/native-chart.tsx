import * as echarts from 'echarts';
import type { ECharts, EChartsOption } from 'echarts';
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

export type NativeChartState = 'ready' | 'loading' | 'empty' | 'error';

export type NativeChartProps = {
  option: EChartsOption;
  title: string;
  ariaLabel?: string;
  height?: number | string;
  className?: string;
  theme?: 'light' | 'dark';
  state?: NativeChartState;
  stateMessage?: string;
};

const stateLabel: Record<Exclude<NativeChartState, 'ready'>, string> = {
  loading: 'Loading chart',
  empty: 'No chart data',
  error: 'Unable to load chart',
};

export function NativeChart({
  option,
  title,
  ariaLabel,
  height = 320,
  className,
  theme = 'light',
  state = 'ready',
  stateMessage,
}: NativeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);
  const optionRef = useRef(option);
  optionRef.current = option;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || state !== 'ready') return undefined;

    const chart = echarts.init(container, theme, { renderer: 'canvas' });
    chartRef.current = chart;
    chart.setOption(optionRef.current, { notMerge: true });

    const resize = () => chart.resize();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      return () => {
        observer.disconnect();
        chart.dispose();
        chartRef.current = null;
      };
    }

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
      chartRef.current = null;
    };
  }, [state, theme]);

  useEffect(() => {
    if (state === 'ready') chartRef.current?.setOption(option, { notMerge: true });
  }, [option, state]);

  if (state !== 'ready') {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md bg-muted/30 text-sm text-muted-foreground',
          className,
        )}
        style={{ minHeight: typeof height === 'number' ? `${height}px` : height }}
        role="status"
        aria-label={ariaLabel ?? title}
        data-chart-state={state}
      >
        {stateMessage ?? stateLabel[state]}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('w-full min-w-0', className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      role="img"
      aria-label={ariaLabel ?? title}
      data-chart-title={title}
    />
  );
}

export const EChart = NativeChart;
