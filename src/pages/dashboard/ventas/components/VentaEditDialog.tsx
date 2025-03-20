
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useVentas, Venta } from "@/hooks/useVentas";
import { useToast } from "@/hooks/use-toast";

interface VentaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: Venta;
  onSuccess: () => void;
}

export const VentaEditDialog = ({ 
  open, 
  onOpenChange, 
  venta, 
  onSuccess 
}: VentaEditDialogProps) => {
  const [precioTotal, setPrecioTotal] = useState<string>(venta?.precio_total?.toString() || '');
  const [esFraccional, setEsFraccional] = useState<boolean>(venta?.es_fraccional || false);
  
  const { updateVenta, isUpdating } = useVentas();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!precioTotal) {
      toast({
        title: "Campo requerido",
        description: "El precio total es requerido",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await updateVenta(venta.id, {
        precio_total: parseFloat(precioTotal),
        es_fraccional: esFraccional
      });
      
      toast({
        title: "Venta actualizada",
        description: "La información de la venta ha sido actualizada exitosamente",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información de la venta",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border border-gray-200 shadow-md">
        <DialogHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2 border-b border-gray-200">
          <DialogTitle>Editar información de venta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-3">
            <Label htmlFor="precio-total" className="text-gray-700">Precio de Venta <span className="text-red-500">*</span></Label>
            <Input
              id="precio-total"
              type="number"
              formatCurrency
              placeholder="$0.00"
              value={precioTotal}
              onChange={(e) => setPrecioTotal(e.target.value)}
              required
              className="border border-gray-300 shadow-sm"
            />
          </div>
          
          <div className="flex items-center space-x-3 pt-2">
            <Switch
              id="es-fraccional"
              checked={esFraccional}
              onCheckedChange={setEsFraccional}
            />
            <Label htmlFor="es-fraccional" className="text-gray-700 cursor-pointer">Venta fraccional</Label>
          </div>
          
          <DialogFooter className="pt-2 px-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300">
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700">
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VentaEditDialog;
