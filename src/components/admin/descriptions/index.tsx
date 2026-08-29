import * as React from 'react';

import { cn } from '@/lib/utils';

export type DescriptionsLayout = 'horizontal' | 'vertical';
export type DescriptionsSize = 'small' | 'default';

export type DescriptionsProps = {
  bordered?: boolean;
  layout?: DescriptionsLayout;
  size?: DescriptionsSize;
  column?: number;
  className?: string;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export type DescriptionsItemProps = {
  label: React.ReactNode;
  span?: number;
  className?: string;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  children?: React.ReactNode;
};

type ParsedDescriptionsItem = {
  key: React.Key;
  label: React.ReactNode;
  span: number;
  className?: string;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  children?: React.ReactNode;
};

const labelSurfaceClass = 'descriptions-label-surface';

const descriptionsDividerClass = 'descriptions-cell-divider';

const sizeClasses: Record<DescriptionsSize, string> = {
  small: 'text-[0.725rem]',
  default: 'text-sm',
};

function isDescriptionsItemElement(
  child: React.ReactNode,
): child is React.ReactElement<DescriptionsItemProps> {
  return (
    React.isValidElement(child) &&
    (child.type as { displayName?: string }).displayName === 'DescriptionsItem'
  );
}

function parseItems(children: React.ReactNode): ParsedDescriptionsItem[] {
  return React.Children.toArray(children)
    .filter(isDescriptionsItemElement)
    .map((child, index) => ({
      key: child.key ?? index,
      label: child.props.label,
      span: child.props.span ?? 1,
      className: child.props.className,
      labelStyle: child.props.labelStyle,
      contentStyle: child.props.contentStyle,
      children: child.props.children,
    }));
}

function packRows(items: ParsedDescriptionsItem[], column: number) {
  const rows: ParsedDescriptionsItem[][] = [];
  let currentRow: ParsedDescriptionsItem[] = [];
  let currentSpan = 0;

  items.forEach((item) => {
    const itemSpan = Math.min(item.span, column);
    if (currentSpan > 0 && currentSpan + itemSpan > column) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }

    currentRow.push({ ...item, span: itemSpan });
    currentSpan += itemSpan;

    if (currentSpan >= column) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
}

function mergeStyles(
  base?: React.CSSProperties,
  override?: React.CSSProperties,
): React.CSSProperties | undefined {
  if (!base && !override) return undefined;
  return { ...base, ...override };
}

function DescriptionsItem(_props: DescriptionsItemProps) {
  return null;
}

DescriptionsItem.displayName = 'DescriptionsItem';

export function Descriptions({
  bordered = false,
  layout = 'horizontal',
  size = 'default',
  column = 3,
  className,
  labelStyle,
  contentStyle,
  style,
  children,
}: DescriptionsProps) {
  const items = parseItems(children);
  const rows = packRows(items, column);
  const textSizeClass = sizeClasses[size];
  const cellPaddingClass = size === 'small' ? 'py-[0.35rem]' : 'py-2';

  if (items.length === 0) {
    return null;
  }

  if (!bordered) {
    return (
      <div className={cn('w-full', textSizeClass, className)} style={style}>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${Math.min(column, items.length)}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item) => (
            <div
              key={item.key}
              className={cn(
                layout === 'vertical' ? 'space-y-1' : 'grid grid-cols-[10rem_minmax(0,1fr)] gap-3',
                item.className,
              )}
              style={{ gridColumn: `span ${Math.min(item.span, column)}` }}
            >
              <div
                className={cn(
                  labelSurfaceClass,
                  'descriptions-label-block rounded-sm border border-solid px-2 font-bold text-foreground',
                  layout === 'horizontal' ? 'text-center' : 'text-start',
                )}
                style={mergeStyles(labelStyle, item.labelStyle)}
              >
                {item.label}
              </div>
              <div
                className="text-start text-foreground"
                style={mergeStyles(contentStyle, item.contentStyle)}
              >
                {item.children ?? '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('descriptions-bordered w-full overflow-hidden rounded-md border', className)}
      style={style}
    >
      <table className={cn('w-full border-collapse', textSizeClass)}>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className={cn('border-b last:border-b-0', descriptionsDividerClass)}>
              {layout === 'vertical'
                ? row.map((item) => (
                    <td
                      key={item.key}
                      colSpan={item.span * 2}
                      className={cn(
                        'border-r last:border-r-0',
                        descriptionsDividerClass,
                        item.className,
                      )}
                    >
                      <div className="flex flex-col">
                        <div
                          className={cn(
                            labelSurfaceClass,
                            'descriptions-label-block border-b border-solid px-3 font-bold text-foreground',
                            cellPaddingClass,
                          )}
                          style={mergeStyles(labelStyle, item.labelStyle)}
                        >
                          {item.label}
                        </div>
                        <div
                          className={cn('px-3 text-start text-foreground', cellPaddingClass)}
                          style={mergeStyles(contentStyle, item.contentStyle)}
                        >
                          {item.children ?? '—'}
                        </div>
                      </div>
                    </td>
                  ))
                : row.map((item, itemIndex) => {
                    const isLastInRow = itemIndex === row.length - 1;
                    const remainingColumns =
                      column -
                      row.slice(0, itemIndex + 1).reduce((sum, current) => sum + current.span, 0);
                    const contentColSpan =
                      item.span * 2 -
                      1 +
                      (isLastInRow && remainingColumns > 0 ? remainingColumns * 2 : 0);

                    return (
                      <React.Fragment key={item.key}>
                        <th
                          className={cn(
                            labelSurfaceClass,
                            'w-40 border-b border-r border-solid px-3 font-bold text-foreground',
                            cellPaddingClass,
                            item.className,
                          )}
                          style={mergeStyles(labelStyle, item.labelStyle)}
                        >
                          {item.label}
                        </th>
                        <td
                          colSpan={contentColSpan}
                          className={cn(
                            'border-r px-3 text-start text-foreground last:border-r-0',
                            descriptionsDividerClass,
                            cellPaddingClass,
                          )}
                          style={mergeStyles(contentStyle, item.contentStyle)}
                        >
                          {item.children ?? '—'}
                        </td>
                      </React.Fragment>
                    );
                  })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Descriptions.Item = DescriptionsItem;

export { DescriptionsItem };
export {
  descriptionsScheFlowBadgeContentStyle,
  descriptionsScheFlowContentStyle,
  descriptionsScheFlowLabelStyle,
  useDescriptionsScheFlowLayout,
} from './scheflow-styles';
