import { LayoutGrid, List, Table2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import type { AdminDataViewMode } from './use-data-view-mode';

type DataViewToggleProps = {
  mode: AdminDataViewMode;
  onChange: (mode: AdminDataViewMode) => void;
  labels: Record<AdminDataViewMode, string>;
};

const options = [
  { mode: 'table', Icon: Table2 },
  { mode: 'grid', Icon: LayoutGrid },
  { mode: 'list', Icon: List },
] as const;

export function DataViewToggle({ mode, onChange, labels }: DataViewToggleProps) {
  return (
    <TooltipProvider>
      <div className="inline-flex rounded-md border bg-background p-1" role="group">
        {options.map(({ mode: option, Icon }) => (
          <Tooltip key={option}>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant={mode === option ? 'secondary' : 'ghost'}
                  aria-label={labels[option]}
                  aria-pressed={mode === option}
                  onClick={() => onChange(option)}
                />
              }
            >
              <Icon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>{labels[option]}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
