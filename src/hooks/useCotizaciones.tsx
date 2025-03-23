
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { SimpleCotizacion, CotizacionesFilters } from './types';

export const useCotizaciones = (
  filters: CotizacionesFilters = {},
  options: { limit?: number } = {}
) => {
  const { limit } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaId } = useUserRole();
  
  // Use a stable empresa ID to avoid unnecessary refetches
  const effectiveEmpresaId = empresaId || null;
  
  // Función para obtener cotizaciones con filtros
  const fetchCotizaciones = async (): Promise<SimpleCotizacion[]> => {
    try {
      console.log('Fetching cotizaciones with filters:', filters);
      
      // Construir la consulta base
      let query = supabase
        .from('cotizaciones')
        .select('*');
      
      // Aplicar filtros adicionales si se proporcionan
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      
      if (filters.leadId) {
        query = query.eq('lead_id', filters.leadId);
      }
      
      if (filters.unidadId) {
        query = query.eq('unidad_id', filters.unidadId);
      }
      
      if (filters.prototipoId) {
        query = query.eq('prototipo_id', filters.prototipoId);
      }
      
      if (filters.desarrolloId) {
        query = query.eq('desarrollo_id', filters.desarrolloId);
      }
      
      if (filters.fechaInicio) {
        query = query.gte('created_at', filters.fechaInicio);
      }
      
      if (filters.fechaFin) {
        query = query.lte('created_at', filters.fechaFin);
      }
      
      // Aplicar límite si se proporciona
      if (limit) {
        query = query.limit(limit);
      }
      
      // Ejecutar la consulta
      const { data, error } = await query;
      
      if (error) {
        console.error('Error al obtener cotizaciones:', error);
        throw error;
      }
      
      // Si no hay resultados, devolver array vacío
      if (!data || data.length === 0) {
        return [];
      }
      
      console.log(`Obtenidas ${data.length} cotizaciones`);
      
      // Convertir y asegurar que los datos coincidan con SimpleCotizacion
      return data as SimpleCotizacion[];
    } catch (error) {
      console.error('Error en fetchCotizaciones:', error);
      throw error;
    }
  };
  
  // Función para crear una cotización
  const createCotizacion = async (cotizacionData: {
    unidad_id?: string;
    precio_total: number;
    enganche_porcentaje?: number;
    plazo_meses?: number;
    tasa_interes?: number;
    nombre_cliente?: string;
    email_cliente?: string;
    telefono_cliente?: string;
    observaciones?: string;
    vendedor_id?: string;
    lead_id?: string;
    prototipo_id?: string;
    desarrollo_id: string;
    monto_anticipo: number;
    numero_pagos: number;
    usar_finiquito?: boolean;
    monto_finiquito?: number;
    fecha_inicio_pagos?: string;
    fecha_finiquito?: string;
    notas?: string;
    estado?: string;
  }) => {
    try {
      // Preparar datos para inserción en Supabase
      const insertData = {
        ...cotizacionData,
        created_at: new Date().toISOString(),
        estado: cotizacionData.estado || 'pendiente'
      };
      
      const { data, error } = await supabase
        .from('cotizaciones')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Error al crear cotización:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error en createCotizacion:', error);
      throw error;
    }
  };
  
  const createCotizacionMutation = useMutation({
    mutationFn: createCotizacion,
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast({
        title: "Cotización creada",
        description: "La cotización ha sido creada exitosamente"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la cotización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      });
    }
  });
  
  // Función para actualizar una cotización
  const updateCotizacion = async (data: { 
    id: string; 
    [key: string]: any;
  }) => {
    try {
      const { id, ...updateData } = data;
      
      const { data: updatedData, error } = await supabase
        .from('cotizaciones')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error al actualizar cotización:', error);
        throw error;
      }
      
      return updatedData;
    } catch (error) {
      console.error('Error en updateCotizacion:', error);
      throw error;
    }
  };
  
  const updateCotizacionMutation = useMutation({
    mutationFn: updateCotizacion,
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast({
        title: "Cotización actualizada",
        description: "La cotización ha sido actualizada exitosamente"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la cotización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      });
    }
  });
  
  // Función para eliminar una cotización
  const deleteCotizacion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cotizaciones')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error al eliminar cotización:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error en deleteCotizacion:', error);
      throw error;
    }
  };
  
  const deleteCotizacionMutation = useMutation({
    mutationFn: deleteCotizacion,
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      toast({
        title: "Cotización eliminada",
        description: "La cotización ha sido eliminada exitosamente"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la cotización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      });
    }
  });
  
  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['cotizaciones', filters, effectiveEmpresaId],
    queryFn: fetchCotizaciones
  });

  return {
    cotizaciones: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    createCotizacion: createCotizacionMutation.mutate,
    updateCotizacion: updateCotizacionMutation.mutate,
    deleteCotizacion: deleteCotizacionMutation.mutate
  };
};

export default useCotizaciones;
