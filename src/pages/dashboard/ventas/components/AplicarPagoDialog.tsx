
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
import { cn, formatCurrency } from "@/lib/utils";
import { PagoCalendarizado } from "@/hooks/usePlanPagos";

interface AplicarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  compradorVentaId: string;
  pagoCalendarizado: PagoCalendarizado | null;
  onSuccess: () => void;
}

export const AplicarPagoDialog = ({ 
  open, 
  onOpenChange, 
  compradorVentaId, 
  pagoCalendarizado,
  onSuccess 
}: AplicarPagoDialogProps) => {
  // Suggest the remaining amount or full amount if no payments applied yet
  const montoSugerido = pagoCalendarizado?.monto_pendiente || pagoCalendarizado?.monto || 0;
  
  const [monto, setMonto] = useState<string>(montoSugerido.toString());
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
      // Build payment description referencing the scheduled payment
      const pagoDesc = pagoCalendarizado ? 
        `Pago para: ${pagoCalendarizado.descripcion} (${format(new Date(pagoCalendarizado.fecha), "d MMM, yyyy")})` : 
        '';
      
      await createPago({
        comprador_venta_id: compradorVentaId,
        monto: parseFloat(monto),
        fecha: fecha.toISOString(),
        metodo_pago: metodoPago,
        referencia,
        notas: pagoDesc + (notas ? `\n${notas}` : ''),
        comprobante_url: comprobanteUrl
      });
      
      toast({
        title: "Pago registrado",
        description: `El pago de ${formatCurrency(parseFloat(monto))} ha sido registrado exitosamente`,
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
          <DialogTitle>
            {pagoCalendarizado ? 
              `Registrar pago para: ${pagoCalendarizado.descripcion}` : 
              'Registrar nuevo pago'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {pagoCalendarizado && (
            <div className="rounded-md bg-muted p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Vencimiento:</span>
                <span className="font-medium">{format(new Date(pagoCalendarizado.fecha), "d 'de' MMMM, yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Monto total:</span>
                <span className="font-medium">{formatCurrency(pagoCalendarizado.monto)}</span>
              </div>
              {pagoCalendarizado.pagos_aplicados && pagoCalendarizado.pagos_aplicados.length > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span>Ya pagado:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(pagoCalendarizado.pagos_aplicados.reduce((sum, p) => sum + p.monto, 0))}
                  </span>
                </div>
              )}
              {pagoCalendarizado.monto_pendiente !== undefined && (
                <div className="flex justify-between text-sm font-medium">
                  <span>Pendiente por pagar:</span>
                  <span className={pagoCalendarizado.monto_pendiente > 0 ? "text-amber-600" : "text-green-600"}>
                    {formatCurrency(pagoCalendarizado.monto_pendiente)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="monto" className="text-gray-700">Monto <span className="text-red-500">*</span></Label>
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
            
            <div className="space-y-3">
              <Label htmlFor="fecha" className="text-gray-700">Fecha <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="fecha"
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
            <div className="space-y-3">
              <Label htmlFor="metodo-pago" className="text-gray-700">Método de pago <span className="text-red-500">*</span></Label>
              <Select 
                value={metodoPago} 
                onValueChange={setMetodoPago}
              >
                <SelectTrigger id="metodo-pago">
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
            
            <div className="space-y-3">
              <Label htmlFor="referencia" className="text-gray-700">Referencia</Label>
              <Input
                id="referencia"
                placeholder="Número de referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="comprobante" className="text-gray-700">Comprobante URL</Label>
            <Input
              id="comprobante"
              placeholder="URL del comprobante"
              value={comprobanteUrl}
              onChange={(e) => setComprobanteUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="notas" className="text-gray-700">Notas adicionales</Label>
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

export default AplicarPagoDialog;
