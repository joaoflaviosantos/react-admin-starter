import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type ConfirmDialogProps = {
  headerTitle?: string;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  trigger: React.ReactNode;
};

export function ConfirmDialog({
  headerTitle,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  disabled = false,
  trigger,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{headerTitle ?? title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          {headerTitle ? <p className="text-sm text-foreground">{title}</p> : null}
          {description ? (
            <AlertDialogDescription className={headerTitle ? 'mt-2' : undefined}>
              {description}
            </AlertDialogDescription>
          ) : !headerTitle ? (
            <AlertDialogDescription>{title}</AlertDialogDescription>
          ) : null}
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
