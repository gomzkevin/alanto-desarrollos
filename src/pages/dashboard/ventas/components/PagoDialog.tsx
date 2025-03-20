
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePagos } from "@/hooks/usePagos";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compradorVentaId: string;
  onSuccess: () => void;
}

export const PagoDialog = ({ open, onOpenChange, compradorVentaId, onSuccess }: PagoDialogProps) => {
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<Date>(new Date());
  const [metodoPago, setMetodoPago] = useState<string>('transferencia');
  const [referencia, setReferencia] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  
  const { createPago, isCreating } = usePagos();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monto || !fecha || !metodoPago) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createPago({
        comprador_venta_id: compradorVentaId,
        monto: parseFloat(monto),
        fecha: fecha.toISOString(),
        metodo_pago: metodoPago,
        referencia,
        notas,
        comprobante_url: comprobanteUrl
      });
      
      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente",
      });
      
      // Reset form and close dialog
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al registrar pago:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el pago. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };
  
  const resetForm = () => {
    setMonto('');
    setFecha(new Date());
    setMetodoPago('transferencia');
    setReferencia('');
    setNotas('');
    setComprobanteUrl('');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar nuevo pago</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto *</Label>
              <Input
                id="monto"
                type="number"
                formatCurrency
                placeholder="$0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fecha && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, "PP") : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={(date) => date && setFecha(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metodo-pago">Método de pago *</Label>
              <Select 
                value={metodoPago} 
                onValueChange={setMetodoPago}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                placeholder="Número de referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comprobante">Comprobante URL</Label>
            <Input
              id="comprobante"
              placeholder="URL del comprobante"
              value={comprobanteUrl}
              onChange={(e) => setComprobanteUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Observaciones o notas adicionales"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Registrando...' : 'Registrar pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
