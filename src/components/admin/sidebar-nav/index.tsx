import { ChevronDown } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type AdminMenuItem = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: AdminMenuItem[];
};

type AdminNavMenuProps = {
  items: AdminMenuItem[];
  selectedKey: string;
  openKeys: string[];
  onOpenChange: (keys: string[]) => void;
  onSelect: (key: string) => void;
  mode?: 'vertical' | 'horizontal';
  collapsed?: boolean;
  className?: string;
};

const collapsedDropdownHoverProps = {
  openOnHover: true,
  delay: 0,
  closeDelay: 150,
} as const;

function verticalItemPaddingStyle(collapsed: boolean | undefined, depth: number) {
  if (collapsed) return undefined;
  return { paddingLeft: `${12 + depth * 16}px` };
}

function verticalItemClassName(collapsed: boolean | undefined, extra?: string) {
  return cn(
    'flex w-full items-center rounded-md py-2 text-sm transition-colors hover:bg-accent',
    collapsed ? 'justify-center px-0' : 'gap-2 px-3',
    extra,
  );
}

function isMenuItemSelected(item: AdminMenuItem, selectedKey: string): boolean {
  if (item.key === selectedKey) return true;
  return item.children?.some((child) => isMenuItemSelected(child, selectedKey)) ?? false;
}

function CollapsedMenuDropdownItems({
  items,
  selectedKey,
  onSelect,
}: {
  items: AdminMenuItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return items.map((child) => {
    const hasGrandchildren = Boolean(child.children?.length);

    if (hasGrandchildren) {
      return (
        <DropdownMenuSub key={child.key}>
          <DropdownMenuSubTrigger
            disabled={child.disabled}
            {...collapsedDropdownHoverProps}
            className={cn(isMenuItemSelected(child, selectedKey) && 'font-semibold text-primary')}
          >
            {child.icon ? <span className="shrink-0">{child.icon}</span> : null}
            <span className="flex-1 truncate">{child.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="min-w-[180px]">
            <CollapsedMenuDropdownItems
              items={child.children!}
              selectedKey={selectedKey}
              onSelect={onSelect}
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }

    return (
      <DropdownMenuItem
        key={child.key}
        disabled={child.disabled}
        onClick={() => onSelect(child.key)}
        className={cn(selectedKey === child.key && 'font-semibold text-primary')}
      >
        {child.icon ? <span className="shrink-0">{child.icon}</span> : null}
        <span className="truncate">{child.label}</span>
      </DropdownMenuItem>
    );
  });
}

function CollapsedVerticalMenuItem({
  item,
  selectedKey,
  onSelect,
}: {
  item: AdminMenuItem;
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const isChildSelected = isMenuItemSelected(item, selectedKey);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        disabled={item.disabled}
        {...collapsedDropdownHoverProps}
        className={verticalItemClassName(
          true,
          cn(
            isChildSelected && 'font-semibold text-primary',
            item.disabled && 'pointer-events-none opacity-50',
          ),
        )}
        title={String(item.label)}
      >
        {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={12}
        alignOffset={-4}
        className="min-w-[180px]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal text-muted-foreground">
            {item.label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <CollapsedMenuDropdownItems
            items={item.children!}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuItem({
  item,
  selectedKey,
  openKeys,
  onOpenChange,
  onSelect,
  mode,
  collapsed,
  depth = 0,
}: {
  item: AdminMenuItem;
  selectedKey: string;
  openKeys: string[];
  onOpenChange: (keys: string[]) => void;
  onSelect: (key: string) => void;
  mode: 'vertical' | 'horizontal';
  collapsed?: boolean;
  depth?: number;
}) {
  const hasChildren = Boolean(item.children?.length);
  const isOpen = openKeys.includes(item.key);
  const isSelected = selectedKey === item.key;
  const isChildSelected = item.children?.some(
    (child) => child.key === selectedKey || child.children?.some((c) => c.key === selectedKey),
  );

  if (hasChildren && mode === 'vertical' && collapsed) {
    return <CollapsedVerticalMenuItem item={item} selectedKey={selectedKey} onSelect={onSelect} />;
  }

  if (hasChildren && mode === 'vertical') {
    return (
      <Collapsible
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            onOpenChange([...openKeys, item.key]);
          } else {
            onOpenChange(openKeys.filter((k) => k !== item.key));
          }
        }}
      >
        <CollapsibleTrigger
          disabled={item.disabled}
          className={verticalItemClassName(
            collapsed,
            cn(
              (isSelected || isChildSelected) && 'font-semibold text-primary',
              item.disabled && 'pointer-events-none opacity-50',
            ),
          )}
          style={verticalItemPaddingStyle(collapsed, depth)}
        >
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
            />
          </>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden">
          <div className="mt-1 space-y-0.5">
            {item.children!.map((child) => (
              <MenuItem
                key={child.key}
                item={child}
                selectedKey={selectedKey}
                openKeys={openKeys}
                onOpenChange={onOpenChange}
                onSelect={onSelect}
                mode={mode}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (hasChildren && mode === 'horizontal') {
    return (
      <div className="group relative">
        <button
          type="button"
          disabled={item.disabled}
          className={cn(
            'flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-accent',
            (isSelected || isChildSelected) && 'font-semibold text-primary',
            item.disabled && 'pointer-events-none opacity-50',
          )}
        >
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <span>{item.label}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <div className="invisible absolute left-0 top-full z-50 min-w-[180px] rounded-md border bg-popover p-1 opacity-0 shadow-md transition-all group-hover:visible group-hover:opacity-100">
          {item.children!.map((child) => (
            <button
              key={child.key}
              type="button"
              disabled={child.disabled}
              onClick={() => onSelect(child.key)}
              className={cn(
                'flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent',
                selectedKey === child.key && 'font-semibold text-primary',
              )}
            >
              {child.icon ? <span className="shrink-0">{child.icon}</span> : null}
              <span>{child.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={item.disabled}
      onClick={() => onSelect(item.key)}
      className={cn(
        mode === 'horizontal'
          ? 'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent'
          : verticalItemClassName(
              collapsed,
              cn(
                isSelected && 'bg-accent font-semibold text-primary',
                item.disabled && 'pointer-events-none opacity-50',
              ),
            ),
      )}
      style={mode === 'vertical' ? verticalItemPaddingStyle(collapsed, depth) : undefined}
      title={collapsed ? String(item.label) : undefined}
    >
      {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
      {!collapsed || mode === 'horizontal' ? (
        <span className={cn('truncate', mode === 'vertical' && 'flex-1 text-left')}>
          {item.label}
        </span>
      ) : null}
    </button>
  );
}

export function AdminNavMenu({
  items,
  selectedKey,
  openKeys,
  onOpenChange,
  onSelect,
  mode = 'vertical',
  collapsed = false,
  className,
}: AdminNavMenuProps) {
  return (
    <nav
      className={cn(
        mode === 'horizontal' ? 'flex items-center gap-1' : 'flex flex-col gap-0.5 p-2',
        collapsed && mode === 'vertical' && 'px-1',
        className,
      )}
    >
      {items.map((item) => (
        <MenuItem
          key={item.key}
          item={item}
          selectedKey={selectedKey}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onSelect={onSelect}
          mode={mode}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );
}
