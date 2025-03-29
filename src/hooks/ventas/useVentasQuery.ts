
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Venta, FetchVentasOptions } from './types';

export const useVentasQuery = (options: FetchVentasOptions = {}) => {
  const { 
    desarrolloId,
    prototipoId,
    unidadId,
    estado,
    limit,
    enabled = true
  } = options;
  
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();

  const fetchVentas = useCallback(async (): Promise<Venta[]> => {
    console.log('Fetching ventas with options:', { ...options, empresaId });
    
    let query = supabase
      .from('ventas')
      .select(`
        *,
        unidad:unidades!inner(
          id, 
          numero,
          prototipo:prototipos!inner(
            id, 
            nombre, 
            precio,
            desarrollo:desarrollos!inner(
              id, 
              nombre, 
              empresa_id
            )
          )
        )
      `);
    
    // Add empresa filter using the relationship path
    if (empresaId) {
      query = query.eq('unidad.prototipo.desarrollo.empresa_id', empresaId);
    }
    
    // Add filters if provided
    if (desarrolloId) {
      query = query.eq('unidad.prototipo.desarrollo.id', desarrolloId);
    }
    
    if (prototipoId) {
      query = query.eq('unidad.prototipo.id', prototipoId);
    }
    
    if (unidadId) {
      query = query.eq('unidad_id', unidadId);
    }
    
    if (estado) {
      query = query.eq('estado', estado);
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    // Execute the query
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching ventas:', error);
      throw error;
    }
    
    return data.map(venta => ({
      id: venta.id,
      created_at: venta.created_at,
      // Handle lead_id safely - it's missing from the returned data structure
      // so we need to check if it exists before accessing it
      lead_id: 'lead_id' in venta ? venta.lead_id : undefined,
      unidad_id: venta.unidad_id,
      estado: venta.estado,
      precio_total: venta.precio_total,
      fecha_inicio: venta.fecha_inicio,
      es_fraccional: venta.es_fraccional,
      fecha_actualizacion: venta.fecha_actualizacion,
      notas: venta.notas,
      prototipo: venta.unidad?.prototipo ? {
        id: venta.unidad.prototipo.id,
        nombre: venta.unidad.prototipo.nombre,
        precio: venta.unidad.prototipo.precio,
        desarrollo: venta.unidad.prototipo.desarrollo
      } : undefined,
      unidad: {
        id: venta.unidad?.id || "",
        numero: venta.unidad?.numero || "",
        prototipo_id: venta.unidad?.prototipo?.id || ""
      }
    })) as Venta[];
  }, [empresaId, desarrolloId, prototipoId, unidadId, estado, limit]);

  const result = useQuery({
    queryKey: ['ventas', empresaId, desarrolloId, prototipoId, unidadId, estado, limit],
    queryFn: fetchVentas,
    enabled: enabled && !!empresaId && !isUserRoleLoading
  });
  
  return {
    ...result,
    ventas: result.data || []
  };
};
