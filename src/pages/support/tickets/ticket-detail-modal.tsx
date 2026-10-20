import { useTranslation } from 'react-i18next';

import {
  Descriptions,
  descriptionsScheFlowBadgeContentStyle,
  descriptionsScheFlowContentStyle,
  descriptionsScheFlowLabelStyle,
  useDescriptionsScheFlowLayout,
} from '@/components/admin/descriptions';
import { DividerProject } from '@/components/divider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { modalContentWidthLgClass } from '@/lib/overlay-surface';
import { cn } from '@/lib/utils';

import type { SupportTicket } from '#/domain';

type TicketDetailModalProps = {
  ticket: SupportTicket | null;
  customerName: string;
  locale: string;
  onClose: () => void;
};

export function TicketDetailModal({
  ticket,
  customerName,
  locale,
  onClose,
}: TicketDetailModalProps) {
  const { t } = useTranslation();
  const layout = useDescriptionsScheFlowLayout();
  if (!ticket) return null;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(ticket.slaDueAt),
  );
  const option = (value: string) => t(`app.common.options.${value}`);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(modalContentWidthLgClass)}>
        <DialogHeader>
          <DialogTitle>{t('app.tickets.details')}</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <DividerProject>{t('app.tickets.sections.request')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item label={t('app.tickets.subject')} span={2}>
              {ticket.subject}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.tickets.customer')}>{customerName}</Descriptions.Item>
            <Descriptions.Item label={t('app.tickets.requester')}>
              {ticket.requesterEmail}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.tickets.descriptionField')} span={2}>
              <span className="whitespace-pre-line">{ticket.description}</span>
            </Descriptions.Item>
          </Descriptions>

          <DividerProject>{t('app.tickets.sections.handling')}</DividerProject>
          <Descriptions
            bordered
            layout={layout}
            size="small"
            column={2}
            labelStyle={descriptionsScheFlowLabelStyle}
            contentStyle={descriptionsScheFlowContentStyle}
          >
            <Descriptions.Item
              label={t('app.tickets.priority')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant="outline">{option(ticket.priority)}</Badge>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('app.common.fields.status')}
              contentStyle={descriptionsScheFlowBadgeContentStyle}
            >
              <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                {option(ticket.status)}
              </Badge>
            </Descriptions.Item>
            <Descriptions.Item label={t('app.tickets.assignee')}>
              {ticket.assignee}
            </Descriptions.Item>
            <Descriptions.Item label={t('app.tickets.sla')}>{date}</Descriptions.Item>
          </Descriptions>
        </DialogBody>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            {t('common.closeText')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
