
import React from 'react';
import { DialogHeader as ShadcnDialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DialogHeaderProps {
  title: string;
  description: string;
  className?: string;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ title, description, className }) => {
  return (
    <ShadcnDialogHeader className={`p-6 bg-gradient-to-r from-indigo-50 to-white border-b-2 border-gray-200 rounded-t-lg sticky top-0 z-10 shadow-sm ${className || ''}`}>
      <DialogTitle className="text-xl font-bold text-indigo-900">{title}</DialogTitle>
      {description && (
        <DialogDescription className="text-gray-600 mt-1.5">{description}</DialogDescription>
      )}
    </ShadcnDialogHeader>
  );
};
