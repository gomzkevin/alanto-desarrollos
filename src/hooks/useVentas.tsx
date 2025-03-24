
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

// Tipos básicos
export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  unidad?: {
    numero: string;
    prototipo?: {
      nombre: string;
      desarrollo?: {
        nombre: string;
        empresa_id?: number;
      };
    };
  };
  progreso?: number;
}

export interface VentasFilter {
  desarrollo_id?: string;
  estado?: string;
  busqueda?: string;
}

export const useVentas = (filters: VentasFilter = {}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { empresaId, userRole } = useUserRole();

  console.log('useVentas - empresaId:', empresaId);
  console.log('useVentas - userRole:', userRole);

  // Consulta para obtener las ventas
  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      console.log('Fetching ventas with empresaId:', empresaId);
      
      let query = supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            numero,
            prototipo:prototipos(
              nombre,
              desarrollo:desarrollos(
                nombre,
                empresa_id
              )
            )
          )
        `);

      // Aplicar filtros si existen
      if (filters.desarrollo_id) {
        query = query.eq('unidad.prototipo.desarrollo.id', filters.desarrollo_id);
      }

      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error al obtener ventas:', error);
        throw error;
      }

      console.log('Ventas raw data:', data);

      // Filtrar las ventas por empresa_id si está disponible
      const filteredData = empresaId
        ? (data || []).filter(venta => {
            console.log('Filtering venta:', venta.id, 'empresa_id:', venta.unidad?.prototipo?.desarrollo?.empresa_id);
            return venta.unidad?.prototipo?.desarrollo?.empresa_id === empresaId;
          })
        : (data || []);
      
      console.log('Filtered ventas:', filteredData.length);

      // Calcular el progreso para cada venta (esto sería un cálculo real en la implementación final)
      return filteredData.map(venta => ({
        ...venta,
        progreso: 30, // Este sería un valor calculado en base a los pagos
      }));
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return [];
    }
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['ventas', filters, empresaId],
    queryFn: fetchVentas,
    enabled: !!empresaId // Sólo ejecutar la consulta si hay un empresaId
  });

  // Función para crear una venta
  const createVenta = async (ventaData: {
    unidad_id: string;
    precio_total: number;
    es_fraccional: boolean;
    estado?: string;
  }) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert({
          unidad_id: ventaData.unidad_id,
          precio_total: ventaData.precio_total,
          es_fraccional: ventaData.es_fraccional,
          estado: ventaData.estado || 'en_proceso'
        })
        .select();

      if (error) throw error;
      
      // También actualizar el estado de la unidad si es necesario
      const { error: unidadError } = await supabase
        .from('unidades')
        .update({ estado: 'en_proceso' })
        .eq('id', ventaData.unidad_id);
        
      if (unidadError) {
        console.error('Error updating unidad estado:', unidadError);
      }
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // Función para actualizar una venta
  const updateVenta = async (id: string, updates: Partial<Omit<Venta, 'id'>>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .update({
          ...updates,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    ventas: data,
    isLoading,
    error,
    refetch,
    createVenta,
    updateVenta,
    isCreating,
    isUpdating
  };
};

export default useVentas;
