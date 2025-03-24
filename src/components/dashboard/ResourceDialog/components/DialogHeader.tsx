
import React from 'react';
import { DialogHeader as ShadcnDialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DialogHeaderProps {
  title: string;
  description?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  title,
  description
}) => {
  return (
    <ShadcnDialogHeader>
      <DialogTitle className="text-2xl font-bold text-indigo-900">{title}</DialogTitle>
      {description && (
        <DialogDescription className="text-gray-600 mt-1">{description}</DialogDescription>
      )}
    </ShadcnDialogHeader>
  );
};
