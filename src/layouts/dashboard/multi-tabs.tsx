import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CSSProperties,
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { Iconify } from '@/components/icon';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import useKeepAlive, { KeepAliveTab } from '@/hooks/web/use-keepalive';
import { cn } from '@/lib/utils';
import { chromeSurfaceClass } from '@/lib/overlay-surface';
import { useRouter } from '@/router/hooks';
import { replaceDynamicParams } from '@/router/hooks/use-match-route-meta';
import { useSettings } from '@/store/settingStore';
import { useResponsive } from '@/theme/hooks';

import {
  HEADER_HEIGHT,
  MULTI_TABS_HEIGHT,
  NAV_COLLAPSED_WIDTH,
  NAV_HORIZONTAL_HEIGHT,
  NAV_WIDTH,
  OFFSET_HEADER_HEIGHT,
} from './config';

import { MultiTabOperation, ThemeLayout } from '#/enum';

const tabBorderClass = 'border-[var(--tab-border)]';

type MultiTabsProps = {
  offsetTop?: boolean;
};

/** Extensible map for dynamic tab labels (e.g. entity detail routes). */
const SpecialTabRenderMap: Record<string, (tab: KeepAliveTab) => ReactNode> = {};

function getContextMenuItemHandlers(action: () => void, disabled = false) {
  if (disabled) {
    return {};
  }

  return {
    onClick: action,
    onMouseUp: (event: MouseEvent) => {
      // Windows classic context menu: release right button on item to activate.
      if (event.button === 2) {
        event.preventDefault();
        action();
      }
    },
  };
}

const tabPanelClass = 'h-full w-full overflow-auto bg-layout p-2.5 sm:p-3 md:p-3.5 lg:p-4';

type SortableTabProps = {
  tab: KeepAliveTab;
  index: number;
  isActive: boolean;
  isHovering: boolean;
  tabsCount: number;
  tabLabel: ReactNode;
  onTabClick: (tab: KeepAliveTab) => void;
  onClose: (key: string) => void;
  onHover: (key: string) => void;
  onHoverLeave: () => void;
  menuContent: ReactNode;
};

function SortableTab({
  tab,
  index,
  isActive,
  isHovering,
  tabsCount,
  tabLabel,
  onTabClick,
  onClose,
  onHover,
  onHoverLeave,
  menuContent,
}: SortableTabProps) {
  const { themeLayout } = useSettings();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (tab.is_tab_hide) return null;

  return (
    <div id={`tab-${index}`} className="shrink-0">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn(
              'relative mx-[0.10rem] flex cursor-pointer select-none items-center rounded-t-lg border-solid py-1 pl-4 pr-2 transition-colors duration-200',
              tabBorderClass,
              themeLayout === ThemeLayout.Horizontal && 'mt-2.5',
              isActive
                ? 'z-[3] -mb-px border-x border-b-[0.1rem] border-t border-b-layout bg-layout font-medium text-primary'
                : cn(
                    'z-[1] border-x border-b-0 border-t bg-card font-light text-muted-foreground',
                    isHovering && 'text-primary/80',
                  ),
            )}
            onMouseEnter={() => {
              if (!isActive) onHover(tab.key);
            }}
            onMouseLeave={onHoverLeave}
          >
            <div
              className="flex min-w-0 flex-1 items-center"
              {...listeners}
              onClick={() => onTabClick(tab)}
            >
              <div className="truncate">{tabLabel}</div>
            </div>
            <span
              role="button"
              tabIndex={-1}
              aria-label="Close tab"
              className={cn(
                'ml-1 inline-flex cursor-pointer opacity-50',
                (!isActive && !isHovering) || tabsCount === 1 ? 'invisible' : 'visible',
              )}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onClose(tab.key);
              }}
            >
              <Iconify icon="ion:close-outline" size={18} />
            </span>
          </div>
        </ContextMenuTrigger>
        {menuContent}
      </ContextMenu>
    </div>
  );
}

export default function MultiTabs({ offsetTop }: MultiTabsProps) {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { themeLayout } = useSettings();
  const { screenMap } = useResponsive();
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [hoveringTabKey, setHoveringTabKey] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pendingFullscreenRef = useRef(false);

  const {
    tabs,
    activeTabRoutePath,
    setTabs,
    closeTab,
    refreshTab,
    closeOthersTab,
    closeAll,
    closeLeft,
    closeRight,
  } = useKeepAlive();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const navigateToTab = useCallback(
    (tab: KeepAliveTab) => {
      const tabKey = replaceDynamicParams(tab.key, tab.params ?? {});
      if (tabKey !== activeTabRoutePath) {
        push(tabKey);
        return true;
      }
      return false;
    },
    [activeTabRoutePath, push],
  );

  const handleMenuAction = useCallback(
    (operation: MultiTabOperation, tab: KeepAliveTab) => {
      switch (operation) {
        case MultiTabOperation.REFRESH:
          navigateToTab(tab);
          refreshTab(tab.key);
          break;
        case MultiTabOperation.CLOSE:
          closeTab(tab.key);
          break;
        case MultiTabOperation.CLOSEOTHERS:
          closeOthersTab(tab.key);
          break;
        case MultiTabOperation.CLOSELEFT:
          closeLeft(tab.key);
          break;
        case MultiTabOperation.CLOSERIGHT:
          closeRight(tab.key);
          break;
        case MultiTabOperation.CLOSEALL:
          closeAll();
          break;
        case MultiTabOperation.FULLSCREEN:
          if (navigateToTab(tab)) {
            pendingFullscreenRef.current = true;
          } else {
            setIsFullscreen((prev) => !prev);
          }
          break;
        default:
          break;
      }
    },
    [navigateToTab, refreshTab, closeTab, closeOthersTab, closeLeft, closeRight, closeAll],
  );

  useEffect(() => {
    if (!pendingFullscreenRef.current) {
      setIsFullscreen(false);
    }
  }, [activeTabRoutePath]);

  useEffect(() => {
    if (!pendingFullscreenRef.current) return;
    pendingFullscreenRef.current = false;
    setIsFullscreen(true);
  }, [activeTabRoutePath]);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const renderTabLabel = useCallback(
    (tab: KeepAliveTab) => {
      const renderer = SpecialTabRenderMap[tab.label];
      return renderer ? renderer(tab) : t(tab.label);
    },
    [t],
  );

  const renderMenuContent = useCallback(
    (tab: KeepAliveTab) => {
      const tabIndex = tabs.findIndex((item) => item.key === tab.key);
      const hasMultipleTabs = tabs.length > 1;
      const canCloseLeft = hasMultipleTabs && tabIndex > 0;
      const canCloseRight = hasMultipleTabs && tabIndex !== -1 && tabIndex < tabs.length - 1;
      const runAction = (operation: MultiTabOperation) => {
        handleMenuAction(operation, tab);
      };

      return (
        <ContextMenuContent>
          <ContextMenuItem
            {...getContextMenuItemHandlers(() => runAction(MultiTabOperation.FULLSCREEN))}
          >
            <Iconify icon="material-symbols:fullscreen" size={18} />
            {t(`sys.tab.${MultiTabOperation.FULLSCREEN}`)}
          </ContextMenuItem>
          <ContextMenuItem
            {...getContextMenuItemHandlers(() => runAction(MultiTabOperation.REFRESH))}
          >
            <Iconify icon="mdi:reload" size={18} />
            {t(`sys.tab.${MultiTabOperation.REFRESH}`)}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!hasMultipleTabs}
            {...getContextMenuItemHandlers(
              () => runAction(MultiTabOperation.CLOSE),
              !hasMultipleTabs,
            )}
          >
            <Iconify icon="material-symbols:close" size={18} />
            {t(`sys.tab.${MultiTabOperation.CLOSE}`)}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={!canCloseLeft}
            {...getContextMenuItemHandlers(
              () => runAction(MultiTabOperation.CLOSELEFT),
              !canCloseLeft,
            )}
          >
            <Iconify
              icon="material-symbols:tab-close-right-outline"
              size={18}
              className="rotate-180"
            />
            {t(`sys.tab.${MultiTabOperation.CLOSELEFT}`)}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!canCloseRight}
            {...getContextMenuItemHandlers(
              () => runAction(MultiTabOperation.CLOSERIGHT),
              !canCloseRight,
            )}
          >
            <Iconify icon="material-symbols:tab-close-right-outline" size={18} />
            {t(`sys.tab.${MultiTabOperation.CLOSERIGHT}`)}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            disabled={!hasMultipleTabs}
            {...getContextMenuItemHandlers(
              () => runAction(MultiTabOperation.CLOSEOTHERS),
              !hasMultipleTabs,
            )}
          >
            <Iconify icon="material-symbols:tab-close-outline" size={18} />
            {t(`sys.tab.${MultiTabOperation.CLOSEOTHERS}`)}
          </ContextMenuItem>
          <ContextMenuItem
            disabled={!hasMultipleTabs}
            {...getContextMenuItemHandlers(
              () => runAction(MultiTabOperation.CLOSEALL),
              !hasMultipleTabs,
            )}
          >
            <Iconify icon="mdi:collapse-all-outline" size={18} />
            {t(`sys.tab.${MultiTabOperation.CLOSEALL}`)}
          </ContextMenuItem>
        </ContextMenuContent>
      );
    },
    [tabs, t, handleMenuAction],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tabs.findIndex((tab) => tab.key === active.id);
      const newIndex = tabs.findIndex((tab) => tab.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      setTabs(arrayMove(tabs, oldIndex, newIndex));
    },
    [tabs, setTabs],
  );

  const handleTabClick = useCallback(
    ({ key, params = {} }: KeepAliveTab) => {
      const tabKey = replaceDynamicParams(key, params);
      push(tabKey);
    },
    [push],
  );

  const multiTabsBarClassName = useMemo(() => {
    const base = cn(
      'fixed z-50 w-full transition-[top] duration-200 ease-in-out',
      chromeSurfaceClass,
    );

    if (themeLayout === ThemeLayout.Horizontal) {
      return cn(base, 'left-0');
    }

    if (screenMap.md) {
      return cn(base, 'right-0');
    }

    return cn(base, 'left-0 w-screen');
  }, [themeLayout, screenMap.md]);

  const multiTabsBarStyle = useMemo(() => {
    const style: CSSProperties = {
      top: offsetTop ? OFFSET_HEADER_HEIGHT - 2 : HEADER_HEIGHT,
      height: themeLayout === ThemeLayout.Horizontal ? MULTI_TABS_HEIGHT + 10 : MULTI_TABS_HEIGHT,
    };

    if (themeLayout === ThemeLayout.Horizontal) {
      style.top = HEADER_HEIGHT + NAV_HORIZONTAL_HEIGHT - 2;
    } else if (screenMap.md) {
      style.left = 'auto';
      style.width = `calc(100% - ${
        themeLayout === ThemeLayout.Vertical ? NAV_WIDTH : NAV_COLLAPSED_WIDTH
      }px)`;
    }

    return style;
  }, [offsetTop, themeLayout, screenMap.md]);

  useEffect(() => {
    if (!scrollContainer.current) return;

    const index = tabs.findIndex((tab) => tab.key === activeTabRoutePath);
    const currentTabElement = scrollContainer.current.querySelector(`#tab-${index}`);
    currentTabElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeTabRoutePath, tabs]);

  useEffect(() => {
    const container = scrollContainer.current;
    if (!container) return;

    const handleMouseWheel = (event: WheelEvent) => {
      event.preventDefault();
      container.scrollLeft += event.deltaY;
    };

    const handleMouseEnter = () => container.addEventListener('wheel', handleMouseWheel);
    const handleMouseLeave = () => container.removeEventListener('wheel', handleMouseWheel);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleMouseWheel);
    };
  }, []);

  return (
    <div className="mt-0.5 h-full w-full">
      <div className={multiTabsBarClassName} style={multiTabsBarStyle}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={tabs.map((tab) => tab.key)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex w-full">
              <div
                ref={scrollContainer}
                className="relative flex w-full items-end overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {tabs.map((tab, index) => (
                  <SortableTab
                    key={tab.key}
                    tab={tab}
                    index={index}
                    isActive={tab.key === activeTabRoutePath}
                    isHovering={tab.key === hoveringTabKey}
                    tabsCount={tabs.length}
                    tabLabel={renderTabLabel(tab)}
                    onTabClick={handleTabClick}
                    onClose={closeTab}
                    onHover={setHoveringTabKey}
                    onHoverLeave={() => setHoveringTabKey('')}
                    menuContent={renderMenuContent(tab)}
                  />
                ))}
                <div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute inset-x-0 bottom-0 z-[2] border-b-[0.1rem]',
                    tabBorderClass,
                  )}
                />
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="h-full w-full">
        {tabs.map((tab) => (
          <div
            key={tab.timeStamp ?? tab.key}
            hidden={tab.key !== activeTabRoutePath}
            className={cn(
              tabPanelClass,
              isFullscreen &&
                tab.key === activeTabRoutePath &&
                'fixed inset-0 z-[100] h-screen w-screen',
            )}
          >
            {tab.children}
          </div>
        ))}
      </div>
    </div>
  );
}
