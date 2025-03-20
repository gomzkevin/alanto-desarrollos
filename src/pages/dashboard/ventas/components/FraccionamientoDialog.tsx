
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface FraccionamientoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const FraccionamientoDialog = ({
  isOpen,
  onClose,
  onConfirm
}: FraccionamientoDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convertir a Venta Fraccional</DialogTitle>
          <DialogDescription>
            Esto permitirá dividir la propiedad entre múltiples compradores.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-start gap-3 p-3 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Atención: Acción irreversible</p>
              <p>
                Una vez que convierta esta venta a fraccional, no podrá revertirla.
                Los compradores actuales se mantendrán, pero podrá ajustar sus porcentajes
                de propiedad y añadir nuevos compradores.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="default"
            onClick={onConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FraccionamientoDialog;
