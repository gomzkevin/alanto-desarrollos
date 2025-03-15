
import { DialogHeader as UIDialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export interface DialogHeaderProps {
  title: string;
  description: string;
}

export function DialogHeader({ title, description }: DialogHeaderProps) {
  return (
    <UIDialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </UIDialogHeader>
  );
}
