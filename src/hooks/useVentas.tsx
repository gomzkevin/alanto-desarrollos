
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useUserRole from '@/hooks/useUserRole';

// Basic types with simplified structures to avoid deep recursion
export interface SimpleDesarrollo {
  id?: string;
  nombre: string;
  ubicacion?: string | null;
  empresa_id?: number;
}

export interface SimplePrototipo {
  id?: string;
  nombre: string;
  precio?: number;
  desarrollo?: SimpleDesarrollo;
}

export interface SimpleUnidad {
  id?: string;
  numero: string;
  estado?: string;
  nivel?: string | null;
  prototipo?: SimplePrototipo;
}

export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  empresa_id?: number;
  notas?: string | null;
  unidad?: SimpleUnidad;
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
      
      // Check for empresa_id column directly in the query
      const hasEmpresaColumn = await supabase.rpc('has_column', {
        table_name: 'ventas',
        column_name: 'empresa_id'
      });
      
      // First fetch basic ventas data without relations
      let query = supabase.from('ventas').select(
        `id, precio_total, estado, es_fraccional, fecha_inicio, fecha_actualizacion, unidad_id, notas${
          hasEmpresaColumn.data ? ', empresa_id' : ''
        }`
      );
      
      // Add empresa_id filter if available and column exists
      if (effectiveEmpresaId && hasEmpresaColumn.data) {
        query = query.eq('empresa_id', effectiveEmpresaId);
      }

      const { data: ventasData, error: ventasError } = await query;

      if (ventasError) {
        console.error('Error al obtener ventas básicas:', ventasError);
        return [];
      }

      // Now fetch the unidades separately to add the relations
      if (!ventasData || ventasData.length === 0) {
        return [];
      }
      
      // Get all unidad_ids
      const unidadIds = ventasData.map(venta => venta.unidad_id);
      
      // Fetch unidades with prototipos and desarrollos
      const { data: unidadesData, error: unidadesError } = await supabase
        .from('unidades')
        .select(`
          id, numero, estado, nivel,
          prototipo:prototipos (
            id, nombre, precio,
            desarrollo:desarrollos (
              id, nombre, ubicacion, empresa_id
            )
          )
        `)
        .in('id', unidadIds);
        
      if (unidadesError) {
        console.error('Error al obtener unidades:', unidadesError);
      }
      
      // Map unidades to ventas
      const ventasWithUnidades = ventasData.map(venta => {
        const unidad = unidadesData?.find(u => u.id === venta.unidad_id);
        return {
          ...venta,
          unidad
        };
      });
      
      // Apply filters in memory 
      let filteredVentas = ventasWithUnidades;
      
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

      // Apply empresa_id filter in memory if needed
      if (effectiveEmpresaId && !hasEmpresaColumn.data) {
        filteredVentas = filteredVentas.filter(venta => {
          // If venta has empresa_id directly
          if ('empresa_id' in venta && venta.empresa_id !== undefined) {
            return venta.empresa_id === effectiveEmpresaId;
          }
          // Or if the desarrollo has empresa_id
          return venta.unidad?.prototipo?.desarrollo?.empresa_id === effectiveEmpresaId;
        });
      }

      // Add mock progress (this would be calculated based on pagos in a real implementation)
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
      // Check if empresa_id column exists
      const hasEmpresaColumn = await supabase.rpc('has_column', {
        table_name: 'ventas',
        column_name: 'empresa_id'
      });
      
      const ventaInsert: any = {
        unidad_id: ventaData.unidad_id,
        precio_total: ventaData.precio_total,
        es_fraccional: ventaData.es_fraccional,
        estado: ventaData.estado || 'en_proceso',
      };
      
      // Only add empresa_id if the column exists
      if (hasEmpresaColumn.data && effectiveEmpresaId) {
        ventaInsert.empresa_id = effectiveEmpresaId;
      }
      
      const { data, error } = await supabase
        .from('ventas')
        .insert(ventaInsert)
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
      // Check if empresa_id column exists
      const hasEmpresaColumn = await supabase.rpc('has_column', {
        table_name: 'ventas',
        column_name: 'empresa_id'
      });
      
      const ventaUpdates: any = {
        ...updates,
        fecha_actualizacion: new Date().toISOString()
      };
      
      // Make sure we're not overriding the empresa_id if it doesn't exist
      if (!hasEmpresaColumn.data) {
        delete ventaUpdates.empresa_id;
      } else if (updates.empresa_id === undefined && effectiveEmpresaId) {
        ventaUpdates.empresa_id = effectiveEmpresaId;
      }
      
      const { data, error } = await supabase
        .from('ventas')
        .update(ventaUpdates)
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
