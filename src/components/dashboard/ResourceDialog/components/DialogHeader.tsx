
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
    <ShadcnDialogHeader className="pb-4 border-b border-indigo-100">
      <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
        {title}
      </DialogTitle>
      {description && (
        <DialogDescription className="text-gray-600 mt-1 text-base">
          {description}
        </DialogDescription>
      )}
    </ShadcnDialogHeader>
  );
};
