
import { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { CompradoresVenta } from '@/hooks/useVentas';
import { useLeads } from '@/hooks/useLeads';
import useVendedores from "@/pages/dashboard/prototipos/hooks/useVendedores";
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from "@/components/ui/spinner";

interface CompradorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CompradoresVenta>) => void;
  comprador: CompradoresVenta | null;
  esFraccional: boolean;
  precioTotal: number;
  porcentajeDisponible: number;
  isLoading: boolean;
  titulo: string;
}

const CompradorDialog = ({
  isOpen,
  onClose,
  onSubmit,
  comprador,
  esFraccional,
  precioTotal,
  porcentajeDisponible,
  isLoading,
  titulo
}: CompradorDialogProps) => {
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const { vendedores, isLoading: isLoadingVendedores } = useVendedores();
  
  // Estados del formulario
  const [compradorId, setCompradorId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [porcentajePropiedad, setPorcentajePropiedad] = useState(100);
  const [montoComprometido, setMontoComprometido] = useState(precioTotal);

  // Inicializar el formulario cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && comprador) {
      setCompradorId(comprador.comprador_id || '');
      setVendedorId(comprador.vendedor_id || '');
      setPorcentajePropiedad(comprador.porcentaje_propiedad || 100);
      setMontoComprometido(comprador.monto_comprometido || precioTotal);
    } else if (isOpen && !comprador) {
      // Valores por defecto para nuevo comprador
      setCompradorId('');
      setVendedorId('');
      
      if (esFraccional) {
        setPorcentajePropiedad(porcentajeDisponible);
        setMontoComprometido((porcentajeDisponible / 100) * precioTotal);
      } else {
        setPorcentajePropiedad(100);
        setMontoComprometido(precioTotal);
      }
    }
  }, [isOpen, comprador, precioTotal, esFraccional, porcentajeDisponible]);

  // Manejar cambio de porcentaje (venta fraccional)
  const handlePorcentajeChange = (value: string) => {
    const porcentaje = parseFloat(value);
    if (isNaN(porcentaje) || porcentaje <= 0) {
      setPorcentajePropiedad(0);
      setMontoComprometido(0);
      return;
    }
    
    const maxPorcentaje = comprador 
      ? porcentajeDisponible + (comprador.porcentaje_propiedad || 0) 
      : porcentajeDisponible;
    
    const porcentajeAjustado = Math.min(porcentaje, maxPorcentaje);
    setPorcentajePropiedad(porcentajeAjustado);
    
    // Actualizar monto comprometido
    const nuevoMonto = (porcentajeAjustado / 100) * precioTotal;
    setMontoComprometido(nuevoMonto);
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!compradorId) return;
    
    onSubmit({
      comprador_id: compradorId,
      vendedor_id: vendedorId || null,
      porcentaje_propiedad: porcentajePropiedad,
      monto_comprometido: montoComprometido
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            {esFraccional 
              ? 'Configure los datos del comprador y su porcentaje de propiedad.'
              : 'Configure los datos del comprador.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comprador">Comprador</Label>
            {isLoadingLeads ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                <LoadingSpinner size="sm" />
                <span className="text-muted-foreground">Cargando compradores...</span>
              </div>
            ) : (
              <Select 
                value={compradorId} 
                onValueChange={setCompradorId}
              >
                <SelectTrigger id="comprador">
                  <SelectValue placeholder="Seleccionar comprador" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor</Label>
            {isLoadingVendedores ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                <LoadingSpinner size="sm" />
                <span className="text-muted-foreground">Cargando vendedores...</span>
              </div>
            ) : (
              <Select 
                value={vendedorId} 
                onValueChange={setVendedorId}
              >
                <SelectTrigger id="vendedor">
                  <SelectValue placeholder="Seleccionar vendedor (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin vendedor</SelectItem>
                  {vendedores.map(vendedor => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {esFraccional && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="porcentaje">Porcentaje de Propiedad</Label>
                <span className="text-sm text-muted-foreground">
                  Máximo: {comprador 
                    ? porcentajeDisponible + (comprador.porcentaje_propiedad || 0) 
                    : porcentajeDisponible}%
                </span>
              </div>
              <Input
                id="porcentaje"
                type="number"
                min="0"
                max={comprador 
                  ? porcentajeDisponible + (comprador.porcentaje_propiedad || 0) 
                  : porcentajeDisponible}
                value={porcentajePropiedad}
                onChange={(e) => handlePorcentajeChange(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="monto">Monto Comprometido</Label>
            {esFraccional ? (
              <div className="relative">
                <Input
                  id="monto"
                  type="text"
                  value={formatCurrency(montoComprometido)}
                  readOnly
                  className="bg-muted/50"
                />
                <div className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                  ({porcentajePropiedad}%)
                </div>
              </div>
            ) : (
              <Input
                id="monto"
                type="text"
                value={formatCurrency(montoComprometido)}
                readOnly
                className="bg-muted/50"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant="default" 
            onClick={handleSubmit}
            disabled={!compradorId || isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompradorDialog;
