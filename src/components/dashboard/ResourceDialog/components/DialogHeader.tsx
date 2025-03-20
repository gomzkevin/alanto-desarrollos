
import React from 'react';
import { DialogHeader as ShadcnDialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DialogHeaderProps {
  title: string;
  description: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ title, description }) => {
  return (
    <ShadcnDialogHeader className="p-6 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100 rounded-t-lg sticky top-0 z-10">
      <DialogTitle className="text-xl font-bold text-indigo-900">{title}</DialogTitle>
      <DialogDescription className="text-gray-600 mt-1">{description}</DialogDescription>
    </ShadcnDialogHeader>
  );
};
