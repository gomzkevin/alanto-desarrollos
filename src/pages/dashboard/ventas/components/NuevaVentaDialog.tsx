
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useVentas } from '@/hooks/useVentas';
import { useUnidades } from '@/hooks/useUnidades';
import { Venta } from '@/hooks/useVentas';

interface NuevaVentaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const NuevaVentaDialog = ({ open, onOpenChange, onSuccess }: NuevaVentaDialogProps) => {
  const [unidadId, setUnidadId] = useState('');
  const [precioTotal, setPrecioTotal] = useState(0);
  const [esFraccional, setEsFraccional] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState<any[]>([]);
  
  const { createVenta, isCreating } = useVentas();
  const { toast } = useToast();

  // Fetch unidades available for sale
  const fetchUnidades = async () => {
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select(`
          id, 
          numero, 
          estado,
          prototipo:prototipos(
            id, 
            nombre, 
            precio,
            desarrollo:desarrollos(
              id, 
              nombre
            )
          )
        `)
        .in('estado', ['disponible', 'apartado'])
        .order('numero', { ascending: true });

      if (error) throw error;
      
      setUnidades(data || []);
    } catch (error) {
      console.error('Error fetching unidades:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las unidades disponibles',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchUnidades();
    }
  }, [open]);

  const handleUnidadChange = (value: string) => {
    setUnidadId(value);
    
    // Find the selected unidad to get its price
    const selectedUnidad = unidades.find(u => u.id === value);
    if (selectedUnidad && selectedUnidad.prototipo) {
      setPrecioTotal(selectedUnidad.prototipo.precio || 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unidadId) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona una unidad',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const nuevaVenta: Partial<Venta> = {
        unidad_id: unidadId,
        precio_total: precioTotal,
        es_fraccional: esFraccional,
        estado: 'en_proceso'
      };
      
      await createVenta(nuevaVenta);
      
      toast({
        title: 'Éxito',
        description: 'Venta creada correctamente',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating venta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la venta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="unidad">Unidad</Label>
            <Select
              value={unidadId}
              onValueChange={handleUnidadChange}
            >
              <SelectTrigger id="unidad">
                <SelectValue placeholder="Seleccionar unidad" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((unidad) => (
                  <SelectItem key={unidad.id} value={unidad.id}>
                    {unidad.prototipo?.desarrollo?.nombre} - {unidad.prototipo?.nombre} - Unidad {unidad.numero}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="precio">Precio Total</Label>
            <Input
              id="precio"
              type="number"
              value={precioTotal}
              onChange={(e) => setPrecioTotal(Number(e.target.value))}
              formatCurrency
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="esFraccional"
              checked={esFraccional}
              onChange={(e) => setEsFraccional(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="esFraccional">Venta Fraccional</Label>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || isCreating}
            >
              {loading || isCreating ? 'Creando...' : 'Crear Venta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NuevaVentaDialog;
