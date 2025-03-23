
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useUserRole from '@/hooks/useUserRole';
import useSupabaseTableHelpers from './useSupabaseTableHelpers';

// Basic types with simplified structures to avoid deep recursion
export interface SimpleDesarrollo {
  id: string;
  nombre: string;
  ubicacion?: string | null;
  empresa_id?: number;
}

export interface SimplePrototipo {
  id: string;
  nombre: string;
  precio?: number;
  desarrollo?: SimpleDesarrollo | null;
}

export interface SimpleUnidad {
  id: string;
  numero: string;
  estado?: string;
  nivel?: string | null;
  prototipo?: SimplePrototipo | null;
}

export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  empresa_id?: number | null;
  notas?: string | null;
  unidad?: SimpleUnidad | null;
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
  const { hasColumn } = useSupabaseTableHelpers();
  
  // Use the specified empresa_id or fall back to the user's empresa_id
  const effectiveEmpresaId = filters.empresa_id !== undefined ? filters.empresa_id : userEmpresaId;

  // Consulta para obtener las ventas
  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      console.log('Fetching ventas with filters:', { ...filters, effectiveEmpresaId });
      
      // Check for empresa_id column directly in the query
      const hasEmpresaColumn = await hasColumn('ventas', 'empresa_id');
      
      // First fetch basic ventas data without relations
      let queryFields = 'id, precio_total, estado, es_fraccional, fecha_inicio, fecha_actualizacion, unidad_id, notas';
      
      if (hasEmpresaColumn) {
        queryFields += ', empresa_id';
      }
      
      let query = supabase.from('ventas').select(queryFields);
      
      // Apply empresa_id filter if applicable
      if (effectiveEmpresaId && hasEmpresaColumn) {
        query = query.eq('empresa_id', effectiveEmpresaId);
      }
      
      const { data: ventasData, error: ventasError } = await query;

      if (ventasError) {
        console.error('Error al obtener ventas básicas:', ventasError);
        return [];
      }

      // If no ventas data, return empty array
      if (!ventasData || ventasData.length === 0) {
        return [];
      }
      
      // Convert ventas data to proper Venta objects
      const ventas: Venta[] = ventasData.map(ventaItem => {
        if (!ventaItem) {
          return {
            id: '',
            precio_total: 0,
            estado: '',
            es_fraccional: false,
            fecha_inicio: '',
            fecha_actualizacion: '',
            unidad_id: '',
            progreso: 0,
            unidad: null
          };
        }
        
        // Use type assertion for safe property access
        const venta = ventaItem as Record<string, any>;
        
        return {
          id: venta.id || '',
          precio_total: venta.precio_total || 0,
          estado: venta.estado || '',
          es_fraccional: venta.es_fraccional || false,
          fecha_inicio: venta.fecha_inicio || '',
          fecha_actualizacion: venta.fecha_actualizacion || '',
          unidad_id: venta.unidad_id || '',
          notas: venta.notas,
          empresa_id: hasEmpresaColumn && 'empresa_id' in venta ? venta.empresa_id : null,
          progreso: 30, // Default progress value
          unidad: null
        };
      });
      
      // Get all unidad_ids
      const unidadIds = ventas
        .map(venta => venta.unidad_id)
        .filter(Boolean);
      
      if (unidadIds.length === 0) {
        return ventas;
      }
      
      // Fetch unidades data
      const { data: unidadesData, error: unidadesError } = await supabase
        .from('unidades')
        .select('id, numero, estado, nivel, prototipo_id')
        .in('id', unidadIds);
        
      if (unidadesError) {
        console.error('Error al obtener unidades:', unidadesError);
        // Continue with basic ventas data
      } else if (unidadesData && unidadesData.length > 0) {
        // Get all prototipo_ids from unidades
        const prototipoIds = unidadesData
          .map(unidad => unidad.prototipo_id)
          .filter(Boolean);
          
        // Initialize prototipossData and desarrollosData variables
        let prototipossData: any[] = [];
        let desarrollosData: any[] = [];
        
        // Fetch prototipos data
        if (prototipoIds.length > 0) {
          const { data, error: prototipossError } = await supabase
            .from('prototipos')
            .select('id, nombre, precio, desarrollo_id')
            .in('id', prototipoIds);
            
          if (prototipossError) {
            console.error('Error al obtener prototipos:', prototipossError);
          } else if (data) {
            prototipossData = data;
            
            // Get all desarrollo_ids from prototipos
            const desarrolloIds = data
              .map(prototipo => prototipo.desarrollo_id)
              .filter(Boolean);
                  
            // Fetch desarrollos data
            if (desarrolloIds.length > 0) {
              const { data: desarrollos, error: desarrollosError } = await supabase
                .from('desarrollos')
                .select('id, nombre, ubicacion, empresa_id')
                .in('id', desarrolloIds);
                
              if (desarrollosError) {
                console.error('Error al obtener desarrollos:', desarrollosError);
              } else if (desarrollos) {
                desarrollosData = desarrollos;
              }
            }
          }
        }
        
        // Map the related data to the ventas
        ventas.forEach(venta => {
          const unidad = unidadesData.find(u => u.id === venta.unidad_id);
          
          if (unidad) {
            const unidadObj: SimpleUnidad = {
              id: unidad.id,
              numero: unidad.numero || '',
              estado: unidad.estado,
              nivel: unidad.nivel,
              prototipo: null
            };
            
            const prototipo = prototipossData.find(p => p.id === unidad.prototipo_id);
            if (prototipo) {
              const prototipoObj: SimplePrototipo = {
                id: prototipo.id,
                nombre: prototipo.nombre || '',
                precio: prototipo.precio,
                desarrollo: null
              };
              
              unidadObj.prototipo = prototipoObj;
              
              const desarrollo = desarrollosData.find(d => d.id === prototipo.desarrollo_id);
              if (desarrollo) {
                prototipoObj.desarrollo = {
                  id: desarrollo.id,
                  nombre: desarrollo.nombre || '',
                  ubicacion: desarrollo.ubicacion,
                  empresa_id: desarrollo.empresa_id as number
                };
              }
            }
            
            venta.unidad = unidadObj;
          }
        });
      }
      
      // Apply filters in memory 
      let filteredVentas = [...ventas];
      
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
      if (effectiveEmpresaId && !hasEmpresaColumn) {
        filteredVentas = filteredVentas.filter(venta => {
          // If venta has empresa_id directly
          if (venta.empresa_id !== undefined && venta.empresa_id !== null) {
            return venta.empresa_id === effectiveEmpresaId;
          }
          // Or if the desarrollo has empresa_id
          return venta.unidad?.prototipo?.desarrollo?.empresa_id === effectiveEmpresaId;
        });
      }

      return filteredVentas;
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
      const hasEmpresaColumn = await hasColumn('ventas', 'empresa_id');
      
      // Create a properly typed object for the insert
      const ventaInsert: {
        unidad_id: string;
        precio_total: number;
        es_fraccional: boolean;
        estado: string;
        empresa_id?: number;
      } = {
        unidad_id: ventaData.unidad_id,
        precio_total: ventaData.precio_total,
        es_fraccional: ventaData.es_fraccional,
        estado: ventaData.estado || 'en_proceso',
      };
      
      // Only add empresa_id if the column exists
      if (hasEmpresaColumn && effectiveEmpresaId) {
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
      const hasEmpresaColumn = await hasColumn('ventas', 'empresa_id');
      
      // Create a properly typed object for the update
      const ventaUpdates: {
        fecha_actualizacion: string;
        empresa_id?: number;
        estado?: string;
        precio_total?: number;
        es_fraccional?: boolean;
        notas?: string | null;
      } = {
        fecha_actualizacion: new Date().toISOString()
      };
      
      // Copy relevant properties from updates to ventaUpdates
      if (updates.estado !== undefined) {
        ventaUpdates.estado = updates.estado;
      }
      
      if (updates.precio_total !== undefined) {
        ventaUpdates.precio_total = updates.precio_total;
      }
      
      if (updates.es_fraccional !== undefined) {
        ventaUpdates.es_fraccional = updates.es_fraccional;
      }
      
      if (updates.notas !== undefined) {
        ventaUpdates.notas = updates.notas;
      }
      
      // Make sure we're not overriding the empresa_id if it doesn't exist
      if (!hasEmpresaColumn) {
        delete ventaUpdates.empresa_id;
      } else if (updates.empresa_id === undefined && effectiveEmpresaId) {
        ventaUpdates.empresa_id = effectiveEmpresaId;
      } else if (updates.empresa_id !== undefined) {
        ventaUpdates.empresa_id = updates.empresa_id as number;
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
