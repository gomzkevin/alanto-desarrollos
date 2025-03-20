
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import useLeads from '@/hooks/useLeads';

interface CompradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaId: string;
  esVentaFraccional: boolean;
  onSuccess: () => void;
}

export const CompradorDialog = ({ 
  open, 
  onOpenChange, 
  ventaId,
  esVentaFraccional,
  onSuccess 
}: CompradorDialogProps) => {
  const [compradorId, setCompradorId] = useState<string>('');
  const [porcentaje, setPorcentaje] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vendedorId, setVendedorId] = useState<string>('');
  const [vendedores, setVendedores] = useState<any[]>([]);
  
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const { toast } = useToast();
  
  // Fetch vendedores
  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('rol', 'vendedor');
          
        if (error) throw error;
        setVendedores(data || []);
      } catch (error) {
        console.error('Error al obtener vendedores:', error);
      }
    };
    
    fetchVendedores();
  }, []);
  
  // If it's not a fractional sale, set porcentaje to 100 and disable editing
  useEffect(() => {
    if (!esVentaFraccional) {
      setPorcentaje('100');
    }
  }, [esVentaFraccional]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!compradorId) {
      toast({
        title: "Campos requeridos",
        description: "Debe seleccionar un comprador",
        variant: "destructive"
      });
      return;
    }
    
    // Get venta details to calculate monto_comprometido
    try {
      setIsSubmitting(true);
      
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .select('precio_total, es_fraccional')
        .eq('id', ventaId)
        .single();
        
      if (ventaError) throw ventaError;
      
      // Calculate monto_comprometido based on percentage
      const montoComprometido = (ventaData.precio_total * parseInt(porcentaje)) / 100;
      
      // Check if total percentage will exceed 100%
      if (esVentaFraccional) {
        const { data: existingCompradores, error: compradoresError } = await supabase
          .from('compradores_venta')
          .select('porcentaje_propiedad')
          .eq('venta_id', ventaId);
          
        if (compradoresError) throw compradoresError;
        
        const totalPorcentaje = (existingCompradores || []).reduce((sum, item) => sum + (item.porcentaje_propiedad || 0), 0);
        
        if (totalPorcentaje + parseInt(porcentaje) > 100) {
          toast({
            title: "Error de porcentaje",
            description: `El porcentaje total no puede exceder el 100%. Actualmente asignado: ${totalPorcentaje}%`,
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        // For non-fractional sales, check if there's already a buyer
        const { data: existingCompradores, error: compradoresError } = await supabase
          .from('compradores_venta')
          .select('id')
          .eq('venta_id', ventaId);
          
        if (compradoresError) throw compradoresError;
        
        if ((existingCompradores || []).length > 0) {
          toast({
            title: "Error",
            description: "Esta venta ya tiene un comprador asignado. Para ventas múltiples, debe marcarla como fraccional.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Get lead details for comprador_nombre
      const selectedLead = leads.find(lead => lead.id === compradorId);
      const compradorNombre = selectedLead?.nombre || 'Comprador';
      
      // Create comprador_venta record
      const { data, error } = await supabase
        .from('compradores_venta')
        .insert({
          venta_id: ventaId,
          comprador_id: compradorId,
          vendedor_id: vendedorId || null,
          porcentaje_propiedad: parseInt(porcentaje),
          monto_comprometido: montoComprometido
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Comprador asignado",
        description: "El comprador ha sido asignado a la venta exitosamente",
      });
      
      onSuccess();
      onOpenChange(false);
      setCompradorId('');
      setPorcentaje(esVentaFraccional ? '' : '100');
      setVendedorId('');
    } catch (error: any) {
      console.error('Error al asignar comprador:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo asignar el comprador a la venta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar comprador a la venta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comprador">Comprador *</Label>
            <Select
              value={compradorId}
              onValueChange={setCompradorId}
            >
              <SelectTrigger>
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="porcentaje">Porcentaje de propiedad {esVentaFraccional ? '' : '(100%)'}</Label>
            <Input
              id="porcentaje"
              type="number"
              min="1"
              max="100"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              disabled={!esVentaFraccional}
              required
            />
            <p className="text-xs text-muted-foreground">
              {esVentaFraccional ? 
                'Porcentaje de la propiedad que corresponde a este comprador' : 
                'En ventas individuales, el comprador adquiere el 100% de la propiedad'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor asignado</Label>
            <Select
              value={vendedorId}
              onValueChange={setVendedorId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar vendedor (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map(vendedor => (
                  <SelectItem key={vendedor.id} value={vendedor.id}>
                    {vendedor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompradorDialog;
