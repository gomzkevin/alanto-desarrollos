
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import useLeads from '@/hooks/useLeads';
import useUsuarios from '@/hooks/useUsuarios';

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
  
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const { usuarios, isLoading: isLoadingUsuarios } = useUsuarios();
  const { toast } = useToast();
  
  // Filtrar solo los usuarios con rol "vendedor"
  const vendedores = usuarios.filter(user => user.rol === 'vendedor' && user.activo);
  
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
      <DialogContent className="sm:max-w-[500px] border border-gray-200 shadow-md">
        <DialogHeader className="bg-gradient-to-r from-indigo-50 to-white pb-2">
          <DialogTitle>Agregar comprador a la venta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="space-y-3">
            <Label htmlFor="comprador" className="text-gray-700">Comprador <span className="text-red-500">*</span></Label>
            <Select
              value={compradorId}
              onValueChange={setCompradorId}
            >
              <SelectTrigger id="comprador" className="border border-gray-200 shadow-sm">
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
          
          <div className="space-y-3">
            <Label htmlFor="porcentaje" className="text-gray-700">Porcentaje de propiedad {esVentaFraccional ? '' : '(100%)'}</Label>
            <Input
              id="porcentaje"
              type="number"
              min="1"
              max="100"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              disabled={!esVentaFraccional}
              required
              className="border border-gray-200 shadow-sm"
            />
            <p className="text-xs text-gray-500">
              {esVentaFraccional ? 
                'Porcentaje de la propiedad que corresponde a este comprador' : 
                'En ventas individuales, el comprador adquiere el 100% de la propiedad'}
            </p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="vendedor" className="text-gray-700">Vendedor asignado</Label>
            <Select
              value={vendedorId}
              onValueChange={setVendedorId}
            >
              <SelectTrigger id="vendedor" className="border border-gray-200 shadow-sm">
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
          
          <DialogFooter className="pt-2 px-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompradorDialog;
