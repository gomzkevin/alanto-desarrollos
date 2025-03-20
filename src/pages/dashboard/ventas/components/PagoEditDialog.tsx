
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Pago } from "@/hooks/usePagos";
import { usePagos } from "@/hooks/usePagos";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PagoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago: Pago | null;
  onSuccess: () => void;
}

export const PagoEditDialog = ({ open, onOpenChange, pago, onSuccess }: PagoEditDialogProps) => {
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<Date>(new Date());
  const [metodoPago, setMetodoPago] = useState<string>('transferencia');
  const [referencia, setReferencia] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [estado, setEstado] = useState<'registrado' | 'verificado' | 'rechazado'>('registrado');
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { isUpdating, updatePagoEstado, deletePago } = usePagos();
  const { toast } = useToast();
  
  // Populate form when pago changes
  useEffect(() => {
    if (pago) {
      setMonto(pago.monto.toString());
      setFecha(new Date(pago.fecha));
      setMetodoPago(pago.metodo_pago);
      setReferencia(pago.referencia || '');
      setNotas(pago.notas || '');
      setEstado(pago.estado);
      setComprobanteUrl(pago.comprobante_url || '');
    }
  }, [pago]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pago) return;
    
    try {
      console.log('Enviando actualización de pago con estado:', estado);
      
      await updatePagoEstado(
        pago.id, 
        {
          monto: parseFloat(monto),
          fecha: fecha.toISOString(),
          metodo_pago: metodoPago,
          referencia,
          estado,
          notas,
          comprobante_url: comprobanteUrl
        }
      );
      
      toast({
        title: "Pago actualizado",
        description: "El pago ha sido actualizado exitosamente",
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pago. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!pago) return;
    
    try {
      await deletePago(pago.id);
      
      toast({
        title: "Pago eliminado",
        description: "El pago ha sido eliminado exitosamente",
      });
      
      setDeleteDialogOpen(false);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el pago. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };
  
  if (!pago) return null;
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar pago</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto *</Label>
                <Input
                  id="monto"
                  type="number"
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
                <Label htmlFor="estado">Estado *</Label>
                <Select 
                  value={estado} 
                  onValueChange={(value) => setEstado(value as 'registrado' | 'verificado' | 'rechazado')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Estado del pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="registrado">Pendiente</SelectItem>
                    <SelectItem value="verificado">Verificado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            
            <DialogFooter className="flex justify-between items-center pt-2">
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
              </Button>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pago y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PagoEditDialog;
