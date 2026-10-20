import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { DashboardPeriod } from '#/domain';

export const dashboardPeriods: DashboardPeriod[] = ['30d', '90d', '12m'];
export const defaultDashboardPeriod: DashboardPeriod = '12m';

type DashboardFiltersProps = {
  open: boolean;
  period: DashboardPeriod;
  onOpenChange: (open: boolean) => void;
  onPeriodChange: (period: DashboardPeriod) => void;
  onReset: () => void;
};

export function DashboardFilters({
  open,
  period,
  onOpenChange,
  onPeriodChange,
  onReset,
}: DashboardFiltersProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[23rem] max-w-[calc(100vw-1rem)] sm:max-w-[23rem]">
        <SheetHeader>
          <SheetTitle>{t('common.filtersText')}</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dashboard-period-filter">{t('app.dashboard.periodLabel')}</Label>
            <Select
              value={period}
              onValueChange={(value) => onPeriodChange(value as DashboardPeriod)}
            >
              <SelectTrigger
                id="dashboard-period-filter"
                aria-label={t('app.dashboard.periodLabel')}
              >
                <SelectValue>{t(`app.dashboard.period${period}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dashboardPeriods.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`app.dashboard.period${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetBody>
        <SheetFooter className="justify-between sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.closeText')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 bg-transparent text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive dark:border-destructive/50 dark:text-red-400 dark:hover:bg-destructive/15 dark:hover:text-red-400"
            onClick={onReset}
          >
            {t('common.resetText')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type DashboardFilterButtonProps = {
  activeFilterCount: number;
  onClick: () => void;
};

export function DashboardFilterButton({ activeFilterCount, onClick }: DashboardFilterButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      size="icon"
      aria-label={t('common.filtersText')}
      title={t('common.filtersText')}
      onClick={onClick}
      className="fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full shadow-lg sm:bottom-6 sm:right-6"
    >
      <Filter className="h-5 w-5" />
      {activeFilterCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
          {activeFilterCount}
        </span>
      ) : null}
    </Button>
  );
}
