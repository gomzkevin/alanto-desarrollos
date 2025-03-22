
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useUserRole from '@/hooks/useUserRole';

// Tipos básicos
export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  empresa_id?: number;
  unidad?: {
    numero: string;
    prototipo?: {
      nombre: string;
      desarrollo?: {
        nombre: string;
        empresa_id?: number;
        id?: string; // Agregado id para resolver error
      };
    };
  };
  progreso?: number;
}

export interface VentasFilter {
  desarrollo_id?: string;
  estado?: string;
  busqueda?: string;
  empresa_id?: number | null;
}

export const useVentas = (filters: VentasFilter = {}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { empresaId: userEmpresaId } = useUserRole();
  
  // Use the specified empresa_id or fall back to the user's empresa_id
  const effectiveEmpresaId = filters.empresa_id !== undefined ? filters.empresa_id : userEmpresaId;

  // Consulta para obtener las ventas
  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      console.log('Fetching ventas with filters:', { ...filters, effectiveEmpresaId });
      
      // Query simplificado para evitar referencias circulares
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          id, precio_total, estado, es_fraccional, fecha_inicio, fecha_actualizacion, 
          unidad_id, empresa_id,
          unidad:unidades(
            numero,
            prototipo:prototipos(
              nombre,
              desarrollo:desarrollos(
                nombre, id, empresa_id
              )
            )
          )
        `);

      if (error) {
        console.error('Error al obtener ventas:', error);
        return [];
      }

      // Aplicar filtros adicionales en memoria para evitar consultas complejas
      let filteredVentas = data || [];
      
      if (filters.desarrollo_id) {
        filteredVentas = filteredVentas.filter(
          venta => venta.unidad?.prototipo?.desarrollo?.id === filters.desarrollo_id
        );
      }

      if (filters.estado && filters.estado !== 'todos') {
        filteredVentas = filteredVentas.filter(
          venta => venta.estado === filters.estado
        );
      }

      // Aplicar filtro de empresa_id en memoria (como respaldo al filtro en la consulta)
      if (effectiveEmpresaId) {
        filteredVentas = filteredVentas.filter(
          venta => venta.empresa_id === effectiveEmpresaId
        );
      }

      // Calcular el progreso para cada venta
      return filteredVentas.map(venta => ({
        ...venta,
        progreso: 30, // Este sería un valor calculado en base a los pagos
      }));
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return [];
    }
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['ventas', filters, effectiveEmpresaId],
    queryFn: fetchVentas,
  });

  // Function to create a venta
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
          estado: ventaData.estado || 'en_proceso',
          empresa_id: effectiveEmpresaId
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

  // Function to update a venta
  const updateVenta = async (id: string, updates: Partial<Omit<Venta, 'id'>>) => {
    setIsUpdating(true);
    try {
      // Make sure we're not overriding the empresa_id
      if (updates.empresa_id === undefined && effectiveEmpresaId) {
        updates.empresa_id = effectiveEmpresaId;
      }
      
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
