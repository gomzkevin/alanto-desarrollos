
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from './useUserRole';

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
    id: string;
    numero: string;
    prototipo_id?: string;
    prototipo?: {
      nombre: string;
      desarrollo_id?: string;
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
  const { empresaId } = useUserRole();

  console.log('useVentas initialized with empresaId:', empresaId);

  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      console.log('Fetching ventas with filters:', filters, 'empresaId:', empresaId);
      
      if (!empresaId) {
        console.log('No empresaId available, returning empty array');
        return [];
      }
      
      // First, get desarrollos for the empresa
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select('id')
        .eq('empresa_id', empresaId);
      
      if (desarrollosError) {
        console.error('Error fetching desarrollos:', desarrollosError);
        return [];
      }
      
      if (!desarrollos || desarrollos.length === 0) {
        console.log('No desarrollos found for empresa_id:', empresaId);
        return [];
      }
      
      // Get the desarrollo IDs
      const desarrolloIds = desarrollos.map(d => d.id);
      console.log('Filtering ventas by desarrollos:', desarrolloIds);
      
      // Now fetch prototipos associated with these desarrollos
      const { data: prototipos, error: prototipesError } = await supabase
        .from('prototipos')
        .select('id, desarrollo_id')
        .in('desarrollo_id', desarrolloIds);
      
      if (prototipesError) {
        console.error('Error fetching prototipos:', prototipesError);
        return [];
      }
      
      if (!prototipos || prototipos.length === 0) {
        console.log('No prototipos found for the desarrollos');
        return [];
      }
      
      // Get the prototipo IDs
      const prototipoIds = prototipos.map(p => p.id);
      
      // Get unidades for these prototipos
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id, prototipo_id')
        .in('prototipo_id', prototipoIds);
      
      if (unidadesError) {
        console.error('Error fetching unidades:', unidadesError);
        return [];
      }
      
      if (!unidades || unidades.length === 0) {
        console.log('No unidades found for the prototipos');
        return [];
      }
      
      // Get the unidad IDs
      const unidadIds = unidades.map(u => u.id);
      
      // Now fetch ventas filtered by these unidades
      let query = supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            id,
            numero,
            prototipo_id,
            prototipo:prototipos(
              nombre,
              desarrollo_id,
              desarrollo:desarrollos(
                nombre,
                empresa_id
              )
            )
          )
        `)
        .in('unidad_id', unidadIds);
      
      // Aplicar filtros si existen
      if (filters.desarrollo_id) {
        // We'll filter client-side since we need to check desarrollo_id through the chain
        console.log('Will filter by desarrollo_id:', filters.desarrollo_id);
      }

      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener ventas:', error);
        throw error;
      }

      console.log('Ventas fetched:', data?.length || 0, 'results');
      
      // Additional client-side filtering if needed
      let filteredData = data || [];
      
      if (filters.desarrollo_id) {
        filteredData = filteredData.filter(venta => 
          venta?.unidad?.prototipo?.desarrollo_id === filters.desarrollo_id
        );
      }

      // Calcular el progreso para cada venta
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
  });

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
