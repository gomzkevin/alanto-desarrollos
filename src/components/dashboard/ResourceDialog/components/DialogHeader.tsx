
import React from 'react';
import { DialogHeader as ShadcnDialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DialogHeaderProps {
  title: string;
  description: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ title, description }) => {
  return (
    <ShadcnDialogHeader className="p-6 bg-gradient-to-r from-white to-indigo-50 border-b border-indigo-100">
      <DialogTitle className="text-xl font-bold text-indigo-900">{title}</DialogTitle>
      <DialogDescription className="text-gray-600">{description}</DialogDescription>
    </ShadcnDialogHeader>
  );
};
