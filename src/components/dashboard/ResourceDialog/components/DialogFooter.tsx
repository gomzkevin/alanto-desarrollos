
import React from 'react';
import { DialogFooter as ShadcnDialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X } from 'lucide-react';

interface DialogFooterProps {
  onClose: () => void;
  onSave: () => Promise<void>;
  isSubmitting?: boolean;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({
  onClose,
  onSave,
  isSubmitting = false
}) => {
  return (
    <ShadcnDialogFooter className="gap-x-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onClose}
        className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        disabled={isSubmitting}
      >
        <X className="mr-2 h-4 w-4" />
        Cancelar
      </Button>
      <Button 
        type="button" 
        onClick={onSave}
        disabled={isSubmitting}
        className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Guardar cotización
          </>
        )}
      </Button>
    </ShadcnDialogFooter>
  );
};
