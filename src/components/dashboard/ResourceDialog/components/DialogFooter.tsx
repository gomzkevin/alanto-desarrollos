
import { DialogFooter as UIDialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export interface DialogFooterProps {
  onClose: () => void;
  onSave: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function DialogFooter({ onClose, onSave, isSubmitting, disabled = false }: DialogFooterProps) {
  return (
    <UIDialogFooter>
      <Button variant="outline" onClick={onClose}>Cancelar</Button>
      <Button 
        onClick={onSave} 
        disabled={isSubmitting || disabled}
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
    </UIDialogFooter>
  );
}
