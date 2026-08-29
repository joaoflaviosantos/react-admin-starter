import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { isNativeAnchorElement, shouldUseNativeButton } from '@/lib/compose-props';
import { cn } from '@/lib/utils';

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger> & {
    asChild?: boolean;
  }
>(({ asChild, children, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return <ContextMenuPrimitive.Trigger ref={ref} render={children} {...props} />;
  }

  return (
    <ContextMenuPrimitive.Trigger ref={ref} {...props}>
      {children}
    </ContextMenuPrimitive.Trigger>
  );
});
ContextMenuTrigger.displayName = 'ContextMenuTrigger';

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.SubmenuRoot;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubmenuTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubmenuTrigger
    ref={ref}
    className={cn(
      'data-popup-open:bg-accent data-highlighted:bg-accent flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </ContextMenuPrimitive.SubmenuTrigger>
));
ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';

const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Popup> &
    Pick<
      React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    >
>(
  (
    { className, side = 'right', sideOffset = 0, align = 'start', alignOffset = -3, ...props },
    ref,
  ) => (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50 outline-none"
      >
        <ContextMenuPrimitive.Popup
          ref={ref}
          className={cn(
            'elevated-surface z-50 min-w-[8rem] overflow-hidden rounded-md border border-border p-1 text-foreground shadow-lg dark:border-transparent',
            'transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  ),
);
ContextMenuSubContent.displayName = 'ContextMenuSubContent';

const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Popup> &
    Pick<
      React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Positioner>,
      'align' | 'alignOffset' | 'side' | 'sideOffset'
    >
>(
  (
    { className, sideOffset = 4, side = 'bottom', align = 'center', alignOffset = 0, ...props },
    ref,
  ) => (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50 outline-none"
      >
        <ContextMenuPrimitive.Popup
          ref={ref}
          className={cn(
            'elevated-surface z-50 max-h-[var(--available-height,300px)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border border-border p-1 text-foreground shadow-md dark:border-transparent',
            'transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  ),
);
ContextMenuContent.displayName = 'ContextMenuContent';

const contextMenuItemBaseClassName =
  'relative flex select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors [&>svg]:size-4 [&>svg]:shrink-0 [&_svg]:size-4 [&_svg]:shrink-0';

const contextMenuItemEnabledClassName =
  'cursor-pointer hover:bg-accent focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground';

const contextMenuItemDisabledClassName =
  'pointer-events-none cursor-default text-muted-foreground opacity-50 hover:bg-transparent focus:bg-transparent data-highlighted:bg-transparent data-highlighted:text-muted-foreground [&_svg]:opacity-50';

function getContextMenuItemClassName({
  disabled = false,
  inset,
  className,
}: {
  disabled?: boolean;
  inset?: boolean;
  className?: string;
}) {
  return cn(
    contextMenuItemBaseClassName,
    disabled ? contextMenuItemDisabledClassName : contextMenuItemEnabledClassName,
    'aria-disabled:pointer-events-none aria-disabled:cursor-default aria-disabled:text-muted-foreground aria-disabled:opacity-50 aria-disabled:hover:bg-transparent aria-disabled:focus:bg-transparent aria-disabled:data-highlighted:bg-transparent aria-disabled:[&_svg]:opacity-50',
    'data-[disabled]:pointer-events-none data-[disabled]:cursor-default data-[disabled]:text-muted-foreground data-[disabled]:opacity-50 data-[disabled]:hover:bg-transparent data-[disabled]:focus:bg-transparent data-[disabled]:data-highlighted:bg-transparent data-[disabled]:[&_svg]:opacity-50',
    inset && 'pl-8',
    className,
  );
}

const ContextMenuItem = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>, 'className'> & {
    className?: string;
    inset?: boolean;
    asChild?: boolean;
  }
>(({ className, inset, asChild, children, disabled = false, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return (
      <ContextMenuPrimitive.Item
        ref={ref}
        disabled={disabled}
        className={getContextMenuItemClassName({ disabled, inset, className })}
        render={children}
        nativeButton={shouldUseNativeButton(children) || isNativeAnchorElement(children)}
        {...props}
      />
    );
  }

  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      disabled={disabled}
      className={getContextMenuItemClassName({ disabled, inset, className })}
      {...props}
    >
      {children}
    </ContextMenuPrimitive.Item>
  );
});
ContextMenuItem.displayName = 'ContextMenuItem';

const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'data-disabled:pointer-events-none data-disabled:opacity-50 relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.CheckboxItemIndicator>
        <Check className="h-4 w-4" />
      </ContextMenuPrimitive.CheckboxItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName = 'ContextMenuCheckboxItem';

const ContextMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'data-disabled:pointer-events-none data-disabled:opacity-50 relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.RadioItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.RadioItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = 'ContextMenuRadioItem';

const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.GroupLabel> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.GroupLabel
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
    {...props}
  />
));
ContextMenuLabel.displayName = 'ContextMenuLabel';

const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
  );
};
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
