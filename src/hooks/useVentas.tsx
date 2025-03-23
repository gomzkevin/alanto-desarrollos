
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Venta, VentasFilters } from './types';

export const useVentas = (
  filters: VentasFilters = {},
  options: { limit?: number } = {}
) => {
  const queryClient = useQueryClient();
  const { limit } = options;
  const { empresaId } = useUserRole();
  
  // Use a stable empresa ID to avoid unnecessary refetches
  const effectiveEmpresaId = empresaId || null;
  
  // Función para obtener ventas con filtros
  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      // Construir la consulta base
      let query = supabase
        .from('ventas')
        .select('*');
      
      // Aplicar filtros de empresa si está disponible
      if (effectiveEmpresaId) {
        query = query.eq('empresa_id', effectiveEmpresaId);
      }
      
      // Aplicar filtros adicionales si se proporcionan
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      
      if (filters.fechaInicio) {
        query = query.gte('fecha_inicio', filters.fechaInicio);
      }
      
      if (filters.fechaFin) {
        query = query.lte('fecha_inicio', filters.fechaFin);
      }
      
      if (filters.unidadId) {
        query = query.eq('unidad_id', filters.unidadId);
      }
      
      // Aplicar límite si se proporciona
      if (limit) {
        query = query.limit(limit);
      }
      
      // Ejecutar la consulta
      const { data, error } = await query;
      
      if (error) {
        console.error('Error al obtener ventas:', error);
        throw error;
      }
      
      // Si no hay resultados, devolver array vacío
      if (!data || data.length === 0) {
        return [];
      }
      
      // Convertir los datos a nuestro tipo Venta
      return data as Venta[];
    } catch (error) {
      console.error('Error en fetchVentas:', error);
      throw error;
    }
  };
  
  const updateVentaStatus = async ({ ventaId, newStatus }: { ventaId: string; newStatus: string }) => {
    console.log(`Cambiando estado de venta ${ventaId} a ${newStatus}`);
    
    try {
      const { data, error } = await supabase
        .from('ventas')
        .update({ estado: newStatus })
        .eq('id', ventaId)
        .select()
        .single();
      
      if (error) {
        console.error('Error al actualizar estado de venta:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error en updateVentaStatus:', error);
      throw error;
    }
  };
  
  const updateVentaMutation = useMutation({
    mutationFn: updateVentaStatus,
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['ventaDetail'] });
    },
  });
  
  const deleteVenta = async (ventaId: string) => {
    console.log(`Eliminando venta ${ventaId}`);
    
    try {
      // Primero eliminar los registros de compradores_venta
      const { error: compradorVentaError } = await supabase
        .from('compradores_venta')
        .delete()
        .eq('venta_id', ventaId);
      
      if (compradorVentaError) {
        console.error('Error al eliminar compradores de venta:', compradorVentaError);
        throw compradorVentaError;
      }
      
      // Luego eliminar los pagos asociados
      const { error: pagosError } = await supabase
        .from('pagos')
        .delete()
        .eq('venta_id', ventaId);
      
      if (pagosError) {
        console.error('Error al eliminar pagos de venta:', pagosError);
        throw pagosError;
      }
      
      // Finalmente eliminar la venta
      const { error: ventaError } = await supabase
        .from('ventas')
        .delete()
        .eq('id', ventaId);
      
      if (ventaError) {
        console.error('Error al eliminar venta:', ventaError);
        throw ventaError;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error en deleteVenta:', error);
      throw error;
    }
  };
  
  const deleteVentaMutation = useMutation({
    mutationFn: deleteVenta,
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
  
  // Function to create a venta
  const createVenta = async (ventaData: {
    unidad_id: string;
    precio_total: number;
    es_fraccional?: boolean;
    estado?: string;
    notas?: string;
  }) => {
    console.log('Creando nueva venta:', ventaData);
    
    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert({
          ...ventaData,
          empresa_id: effectiveEmpresaId,
          fecha_inicio: new Date().toISOString(),
          fecha_actualizacion: new Date().toISOString(),
          es_fraccional: ventaData.es_fraccional || false,
          estado: ventaData.estado || 'en_proceso'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error al crear venta:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error en createVenta:', error);
      throw error;
    }
  };
  
  const createVentaMutation = useMutation({
    mutationFn: createVenta,
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
  
  // Modificar venta
  const updateVenta = async (ventaData: {
    id: string;
    precio_total?: number;
    es_fraccional?: boolean;
    estado?: string;
    notas?: string;
  }) => {
    console.log('Actualizando venta:', ventaData);
    
    try {
      const { id, ...updateData } = ventaData;
      
      const { data, error } = await supabase
        .from('ventas')
        .update({
          ...updateData,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error al actualizar venta:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error en updateVenta:', error);
      throw error;
    }
  };
  
  const updateVentaFullMutation = useMutation({
    mutationFn: updateVenta,
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['ventaDetail'] });
    },
  });
  
  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['ventas', filters, effectiveEmpresaId],
    queryFn: fetchVentas,
  });

  return {
    ventas: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    updateVentaStatus: updateVentaMutation.mutate,
    deleteVenta: deleteVentaMutation.mutate,
    createVenta: createVentaMutation.mutate,
    updateVenta: updateVentaFullMutation.mutate
  };
};

export default useVentas;
