
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
      console.log('Actualizando pago:', id, 'con datos:', actualizacion);
      console.log('Estado a actualizar:', actualizacion.estado);

      // Primero obtenemos el pago completo para asegurar que tenemos todos los datos
      const { data: pagoActual, error: fetchError } = await supabase
        .from('pagos')
        .select('*')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error al obtener pago actual:', fetchError);
        throw fetchError;
      }
      
      console.log('Pago actual obtenido:', pagoActual);
      
      // Construimos el objeto de actualización con todos los campos necesarios
      const datosActualizados = {
        ...pagoActual,
        ...actualizacion,
      };
      
      // Eliminamos campos que no deben actualizarse directamente
      delete datosActualizados.id;
      delete datosActualizados.created_at;
      
      console.log('Datos completos para actualización:', datosActualizados);
      
      // Realizamos la actualización directa sin usar joins o relaciones
      const { data, error } = await supabase
        .from('pagos')
        .update(datosActualizados)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error detallado en actualización:', error);
        throw error;
      }
      
      console.log('Actualización exitosa, resultado:', data);
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Error al actualizar pago:', error);
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
