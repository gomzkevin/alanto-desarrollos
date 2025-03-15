
import React from 'react';
import { DialogFooter as UIDialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormValues } from '../types';

interface DialogFooterProps {
  onClose: () => void;
  onSave: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export function DialogFooter({ onClose, onSave, isSubmitting, disabled }: DialogFooterProps) {
  return (
    <UIDialogFooter>
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        onClick={onSave}
        disabled={isSubmitting || disabled}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
            Guardando...
          </>
        ) : (
          'Guardar'
        )}
      </Button>
    </UIDialogFooter>
  );
}
