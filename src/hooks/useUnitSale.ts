
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useUnitSale = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Función para crear una venta y redireccionar
  const createSaleAndRedirect = async (unidad: any) => {
    if (!unidad || !unidad.id) {
      toast({
        title: "Error",
        description: "No se puede crear una venta sin una unidad válida",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verificar si ya existe una venta para esta unidad
      const { data: existingVenta, error: searchError } = await supabase
        .from('ventas')
        .select('id')
        .eq('unidad_id', unidad.id)
        .maybeSingle();
      
      if (searchError) throw searchError;
      
      let ventaId;
      
      if (existingVenta) {
        // Si ya existe una venta, usamos ese ID
        ventaId = existingVenta.id;
        console.log('Venta existente encontrada:', ventaId);
      } else {
        // Si no existe, creamos una nueva venta
        const { data: newVenta, error: createError } = await supabase
          .from('ventas')
          .insert({
            unidad_id: unidad.id,
            precio_total: unidad.precio_venta || unidad.prototipo?.precio || 0,
            estado: 'en_proceso',
            es_fraccional: false
          })
          .select('id')
          .single();
        
        if (createError) throw createError;
        
        // Actualizamos el estado de la unidad
        const { error: updateError } = await supabase
          .from('unidades')
          .update({ estado: 'en_proceso' })
          .eq('id', unidad.id);
        
        if (updateError) throw updateError;
        
        ventaId = newVenta.id;
        console.log('Nueva venta creada:', ventaId);
      }
      
      // Redirigimos a la página de detalle de la venta
      if (ventaId) {
        toast({
          title: "Venta creada",
          description: "Redirigiendo al detalle de la venta..."
        });
        
        setTimeout(() => {
          navigate(`/dashboard/ventas/${ventaId}`);
        }, 500);
      }
    } catch (err) {
      console.error('Error en createSaleAndRedirect:', err);
      toast({
        title: "Error al crear la venta",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { createSaleAndRedirect, isLoading };
};

export default useUnitSale;
