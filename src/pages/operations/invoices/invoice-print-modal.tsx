import { Printer } from 'lucide-react';
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

import { InvoiceDocument } from './invoice-document';

import type { Invoice } from '#/domain';

type InvoicePrintModalProps = {
  invoice: Invoice | null;
  locale: string;
  onClose: () => void;
};

export function InvoicePrintModal({ invoice, locale, onClose }: InvoicePrintModalProps) {
  const { t } = useTranslation();
  if (!invoice) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="invoice-print-modal max-h-[92vh] sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t('app.invoices.previewTitle')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="invoice-print-modal-body max-h-[74vh] overflow-y-auto bg-muted/30">
          <InvoiceDocument invoice={invoice} locale={locale} />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('app.common.actions.close')}
          </Button>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            {t('app.invoices.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
