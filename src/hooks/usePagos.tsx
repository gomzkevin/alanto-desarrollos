
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pago {
  id: string;
  comprador_venta_id: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  estado: 'registrado' | 'verificado' | 'rechazado';
  referencia?: string;
  comprobante_url?: string;
  notas?: string;
  created_at: string;
}

export interface NuevoPago {
  comprador_venta_id: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  referencia?: string;
  comprobante_url?: string;
  notas?: string;
}

export interface ActualizacionPago {
  monto?: number;
  fecha?: string;
  metodo_pago?: string;
  estado?: 'registrado' | 'verificado' | 'rechazado';
  referencia?: string;
  comprobante_url?: string;
  notas?: string;
}

export const usePagos = (compradorVentaId?: string) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Obtener pagos por comprador_venta_id
  const fetchPagos = async (): Promise<Pago[]> => {
    if (!compradorVentaId) return [];
    
    try {
      let query = supabase
        .from('pagos')
        .select('*')
        .eq('comprador_venta_id', compradorVentaId)
        .order('fecha', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      // Map the data to ensure estados conform to the expected type
      const typedPagos: Pago[] = (data || []).map(pago => ({
        ...pago,
        estado: (pago.estado === 'verificado' || pago.estado === 'registrado' || pago.estado === 'rechazado') 
          ? pago.estado as 'verificado' | 'registrado' | 'rechazado'
          : 'registrado' // Default value if it doesn't match expected values
      }));
      
      return typedPagos;
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos",
        variant: "destructive"
      });
      return [];
    }
  };

  const { data: pagos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['pagos', compradorVentaId],
    queryFn: fetchPagos,
    enabled: !!compradorVentaId
  });

  // Crear un nuevo pago
  const createPago = async (nuevoPago: NuevoPago) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('pagos')
        .insert({
          ...nuevoPago,
          estado: 'registrado',
        })
        .select();

      if (error) throw error;
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Actualizar un pago
  const updatePagoEstado = async (id: string, actualizacion: ActualizacionPago) => {
    setIsUpdating(true);
    try {
      // Si estamos intentando actualizar a estado verificado, manejarlo de manera especial
      if (actualizacion.estado === 'verificado') {
        // 1. Primero, obtener el pago actual
        const { data: pagoActual, error: fetchError } = await supabase
          .from('pagos')
          .select('*')
          .eq('id', id)
          .single();
          
        if (fetchError) {
          console.error('Error al obtener pago actual:', fetchError);
          throw fetchError;
        }
        
        // 2. Actualizar SOLO el estado a verificado
        const { data: estadoUpdate, error: estadoError } = await supabase
          .from('pagos')
          .update({ estado: 'verificado' })
          .eq('id', id)
          .select();
        
        if (estadoError) {
          console.error('Error al actualizar estado del pago:', estadoError);
          throw estadoError;
        }
        
        // 3. Si hay otros campos para actualizar además del estado
        const { estado, ...otrosAtributos } = actualizacion;
        
        if (Object.keys(otrosAtributos).length > 0) {
          // 4. Actualizar los demás campos en una operación separada
          const { error: atributosError } = await supabase
            .from('pagos')
            .update(otrosAtributos)
            .eq('id', id);
            
          if (atributosError) {
            console.error('Error al actualizar atributos adicionales:', atributosError);
            // No lanzamos error aquí, el cambio de estado ya se completó
            toast({
              title: "Advertencia",
              description: "El pago fue verificado, pero hubo un error al actualizar algunos campos adicionales",
              variant: "destructive"  // Cambiado de "warning" a "destructive"
            });
          }
        }
        
        await refetch();
        return estadoUpdate;
      } else {
        // Para otros estados, realizar la actualización normalmente
        const { data, error } = await supabase
          .from('pagos')
          .update(actualizacion)
          .eq('id', id)
          .select();

        if (error) {
          console.error('Error al actualizar pago:', error);
          throw error;
        }
        
        await refetch();
        return data;
      }
    } catch (error) {
      console.error('Error general al actualizar pago:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Eliminar un pago
  const deletePago = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('pagos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refetch();
      return true;
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    pagos,
    isLoading,
    error,
    refetch,
    createPago,
    updatePagoEstado,
    deletePago,
    isCreating,
    isUpdating,
    isDeleting
  };
};

export default usePagos;
