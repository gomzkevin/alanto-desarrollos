
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SellUnidadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isProcessing: boolean;
  unidadNumero?: string;
}

const SellUnidadDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  unidadNumero
}: SellUnidadDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error vendiendo unidad:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vender Unidad</DialogTitle>
          <DialogDescription>
            Esta acción cambiará el estado de la unidad {unidadNumero || ""} a "vendido".
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-slate-600">
            ¿Estás seguro que deseas proceder con la venta de esta unidad?
            Esta operación creará un registro de venta y actualizará el inventario.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            type="button"
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isProcessing}
            type="button"
          >
            {isProcessing ? "Procesando..." : "Confirmar Venta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellUnidadDialog;
