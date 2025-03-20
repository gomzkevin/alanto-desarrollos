
import React from 'react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { ShoppingCart } from 'lucide-react';

interface SellUnidadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isProcessing: boolean;
  unidadNumero?: string;
}

export const SellUnidadDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isProcessing,
  unidadNumero 
}: SellUnidadDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Iniciar proceso de venta
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción creará una nueva venta para la unidad {unidadNumero || ""} y serás 
            redirigido a la pantalla de gestión de ventas para continuar con el proceso.
            <br /><br />
            <span className="font-medium text-amber-600">
              ¿Estás seguro de que deseas continuar?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isProcessing}
            className="bg-primary"
          >
            {isProcessing ? "Procesando..." : "Iniciar venta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SellUnidadDialog;
