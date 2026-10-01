import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Customer } from '#/examples';

type CustomerDetailDialogProps = {
  customer: Customer | null;
  locale: string;
  onClose: () => void;
};

export function CustomerDetailDialog({ customer, locale, onClose }: CustomerDetailDialogProps) {
  const { t } = useTranslation();
  if (!customer) return null;
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    customer.mrrCents / 100,
  );
  const details = [
    [t('examples.customers.contact'), customer.contactName],
    [t('examples.common.fields.email'), customer.email],
    [t('examples.customers.industry'), customer.industry],
    [t('examples.customers.mrr'), money],
    [t('examples.customers.seats'), `${customer.seatsUsed}/${customer.seatsLimit}`],
    [t('examples.customers.health'), `${customer.healthScore}/100`],
  ];
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('examples.customers.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('examples.common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
