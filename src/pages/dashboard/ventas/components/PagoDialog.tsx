
import { useState } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { CompradoresVenta, Pago } from '@/hooks/useVentas';
import { useUserRole } from '@/hooks/useUserRole';
import LoadingSpinner from "@/components/ui/spinner";

interface PagoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pagoData: Omit<Pago, 'id' | 'created_at' | 'comprador_venta_id'>) => void;
  comprador: CompradoresVenta | null;
  isLoading: boolean;
}

const PagoDialog = ({
  isOpen,
  onClose,
  onSubmit,
  comprador,
  isLoading
}: PagoDialogProps) => {
  const { userId } = useUserRole();
  
  // Estado del formulario
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [metodoPago, setMetodoPago] = useState<string>('transferencia');
  const [referencia, setReferencia] = useState<string>('');
  const [comprobante, setComprobante] = useState<string>('');
  const [notas, setNotas] = useState<string>('');

  // Resetear formulario cuando se cierra
  const handleClose = () => {
    setMonto('');
    setFecha(new Date().toISOString().substring(0, 10));
    setMetodoPago('transferencia');
    setReferencia('');
    setComprobante('');
    setNotas('');
    onClose();
  };

  // Validar monto (solo números y punto decimal)
  const validateMonto = (value: string) => {
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (regex.test(value) || value === '') {
      setMonto(value);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!comprador) return;
    
    const montoNumerico = parseFloat(monto);
    if (isNaN(montoNumerico) || montoNumerico <= 0) return;
    
    onSubmit({
      monto: montoNumerico,
      fecha: fecha ? new Date(fecha).toISOString() : new Date().toISOString(),
      metodo_pago: metodoPago,
      referencia: referencia || null,
      comprobante_url: comprobante || null,
      estado: 'registrado',
      notas: notas || null,
      registrado_por: userId || null
    });
  };

  // Helper para validar que el formato de fecha sea correcto
  const isValidDate = (dateString: string) => {
    if (!dateString) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  // Validar formulario
  const isFormValid = () => {
    const montoNumerico = parseFloat(monto);
    return !isNaN(montoNumerico) && 
           montoNumerico > 0 && 
           isValidDate(fecha) && 
           metodoPago !== '';
  };

  // Si no hay comprador, no mostrar nada
  if (!comprador) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Complete la información del pago para {comprador.comprador?.nombre || 'el comprador'}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monto">Monto *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5">$</span>
              <Input
                id="monto"
                type="text"
                value={monto}
                onChange={(e) => validateMonto(e.target.value)}
                className="pl-7"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha de pago *</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodoPago">Método de pago *</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger id="metodoPago">
                <SelectValue placeholder="Seleccionar método de pago" />
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
            <Label htmlFor="referencia">Referencia (opcional)</Label>
            <Input
              id="referencia"
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ej: Número de transferencia, folio de cheque"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comprobante">URL de comprobante (opcional)</Label>
            <Input
              id="comprobante"
              type="text"
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
              placeholder="Ej: https://ejemplo.com/comprobante.pdf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Información adicional sobre el pago"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant="default" 
            onClick={handleSubmit}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Registrando...
              </>
            ) : (
              'Registrar Pago'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PagoDialog;
