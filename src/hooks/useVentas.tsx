
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // Consulta para obtener las ventas
  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      let query = supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            numero,
            prototipo:prototipos(
              nombre,
              desarrollo:desarrollos(
                nombre
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

      if (error) throw error;

      // Calcular el progreso para cada venta (esto sería un cálculo real en la implementación final)
      return (data || []).map(venta => ({
        ...venta,
        progreso: 30, // Este sería un valor calculado en base a los pagos
      }));
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return [];
    }
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['ventas', filters],
    queryFn: fetchVentas,
  });

  // Función para crear una venta
  const createVenta = async (ventaData: Partial<Venta>) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert(ventaData)
        .select();

      if (error) throw error;
      
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
  const updateVenta = async (id: string, updates: Partial<Venta>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .update(updates)
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
