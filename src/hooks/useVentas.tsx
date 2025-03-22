
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useUserRole from '@/hooks/useUserRole';

// Basic types
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
  unidad?: {
    id?: string;
    numero: string;
    estado?: string;
    nivel?: string | null;
    prototipo?: {
      id?: string;
      nombre: string;
      precio?: number;
      desarrollo?: {
        nombre: string;
        ubicacion?: string | null;
        empresa_id?: number;
        id?: string;
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
      
      // Check for empresa_id column directly in the query
      const hasEmpresaColumn = await supabase.rpc('has_column', {
        table_name: 'ventas',
        column_name: 'empresa_id'
      });
      
      // Construct the select query string based on column existence
      let selectQuery = 'id, precio_total, estado, es_fraccional, fecha_inicio, fecha_actualizacion, unidad_id, notas';
      
      if (hasEmpresaColumn.data) {
        selectQuery += ', empresa_id';
      }
      
      // Add the relational data
      selectQuery += `, unidad:unidades(
        id, numero, estado, nivel,
        prototipo:prototipos(
          id, nombre, precio,
          desarrollo:desarrollos(
            id, nombre, ubicacion, empresa_id
          )
        )
      )`;
      
      // Construct the query carefully to avoid type errors
      let query = supabase.from('ventas').select(selectQuery);
      
      // Add empresa_id filter if available and column exists
      if (effectiveEmpresaId && hasEmpresaColumn.data) {
        query = query.eq('empresa_id', effectiveEmpresaId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener ventas:', error);
        return [];
      }

      // Ensure we have an array to work with
      let ventas = data || [];
      
      // Aplicar filtros adicionales en memoria para evitar consultas complejas
      let filteredVentas = ventas;
      
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

      // Aplicar filtro de empresa_id en memoria si no se pudo filtrar en la base de datos
      if (effectiveEmpresaId && !hasEmpresaColumn.data) {
        filteredVentas = filteredVentas.filter(
          venta => {
            // Si venta tiene empresa_id directamente
            if ('empresa_id' in venta && venta.empresa_id !== undefined) {
              return venta.empresa_id === effectiveEmpresaId;
            }
            // O si el desarrollo tiene empresa_id
            return venta.unidad?.prototipo?.desarrollo?.empresa_id === effectiveEmpresaId;
          }
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
