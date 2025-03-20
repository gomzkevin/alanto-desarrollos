
import React from 'react';
import { DialogFooter as ShadcnDialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DialogFooterProps {
  onClose: () => void;
  onSave: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  onClose,
  onSave,
  isSubmitting = false,
  className
}) => {
  return (
    <ShadcnDialogFooter className={`p-4 border-t bg-gray-50 ${className || ''}`}>
      <div className="flex gap-2 w-full justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="px-4 border-gray-300"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </div>
    </ShadcnDialogFooter>
  );
};
