import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pago } from './types/venta.types';

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
  estado?: 'registrado' | 'rechazado';
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
        estado: pago.estado === 'rechazado' ? 'rechazado' : 'registrado'
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
      // Realizar una actualización directa sin lógica especial para diferentes estados
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
