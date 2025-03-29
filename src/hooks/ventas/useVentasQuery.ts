
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks';
import { Venta } from './types';

export type FetchVentasOptions = {
  desarrolloId?: string;
  prototipoId?: string;
  unidadId?: string;
  estado?: string;
  limit?: number;
  enabled?: boolean;
};

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

  const fetchVentas = async (): Promise<Venta[]> => {
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
    
    return data as Venta[];
  };

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
