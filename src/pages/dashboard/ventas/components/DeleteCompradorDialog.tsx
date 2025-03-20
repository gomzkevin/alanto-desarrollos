
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { CompradoresVenta } from '@/hooks/useVentas';
import LoadingSpinner from "@/components/ui/spinner";

interface DeleteCompradorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  comprador: CompradoresVenta | null;
  isLoading: boolean;
}

const DeleteCompradorDialog = ({
  isOpen,
  onClose,
  onConfirm,
  comprador,
  isLoading
}: DeleteCompradorDialogProps) => {
  // Si no hay comprador seleccionado, no mostrar nada
  if (!comprador) return null;

  const nombreComprador = comprador.comprador?.nombre || 'este comprador';
  const tienePagos = comprador.pagos && comprador.pagos.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Comprador</DialogTitle>
          <DialogDescription>
            ¿Está seguro que desea eliminar a {nombreComprador} de esta venta?
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 text-red-800 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Esta acción no se puede deshacer</p>
              <p>
                Al eliminar este comprador, se eliminarán también todos sus {tienePagos ? 'pagos y ': ''}
                datos asociados a esta venta.
              </p>
              {tienePagos && (
                <p className="mt-1 font-medium">
                  ADVERTENCIA: Este comprador tiene pagos registrados.
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCompradorDialog;
