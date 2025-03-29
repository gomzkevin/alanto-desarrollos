
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useUserRole } from './useUserRole';

export type Cotizacion = Tables<"cotizaciones">;

export type ExtendedCotizacion = Cotizacion & {
  lead?: Tables<"leads"> | null;
  desarrollo?: Tables<"desarrollos"> | null;
  prototipo?: Tables<"prototipos"> | null;
  fecha_inicio_pagos?: string | null;
  fecha_finiquito?: string | null;
};

type FetchCotizacionesOptions = {
  limit?: number;
  withRelations?: boolean;
  staleTime?: number;
  desarrolloId?: string;
  prototipoId?: string;
};

export const useCotizaciones = (options: FetchCotizacionesOptions = {}) => {
  const { limit, withRelations = false, staleTime = 30000, desarrolloId, prototipoId } = options;
  const { empresaId } = useUserRole();
  
  // Function to fetch cotizaciones
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    if (!empresaId) {
      console.log('No empresaId available, returning empty array');
      return [];
    }
    
    try {
      // Get desarrollos for the empresa
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
      
      // Now fetch cotizaciones with a single optimized query that includes all relations
      let query = supabase
        .from('cotizaciones')
        .select(`
          *,
          desarrollo:desarrollos(*),
          prototipo:prototipos(*),
          lead:leads(*)
        `)
        .in('desarrollo_id', desarrolloIds);
      
      // Add filters if provided
      if (desarrolloId) {
        query = query.eq('desarrollo_id', desarrolloId);
      }
      
      if (prototipoId) {
        query = query.eq('prototipo_id', prototipoId);
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: cotizaciones, error } = await query;
      
      if (error) {
        console.error('Error fetching cotizaciones:', error);
        throw new Error(error.message);
      }
      
      console.log('Cotizaciones fetched:', cotizaciones?.length || 0, 'results');
      return cotizaciones as ExtendedCotizacion[] || [];
    } catch (error) {
      console.error('Error in fetchCotizaciones:', error);
      return [];
    }
  };

  // Use React Query to fetch and cache the data with improved caching
  const queryResult = useQuery({
    queryKey: ['cotizaciones', limit, withRelations, empresaId, desarrolloId, prototipoId],
    queryFn: fetchCotizaciones,
    staleTime: staleTime, // Use configurable stale time
    enabled: !!empresaId, // Only run if empresaId exists
    refetchOnWindowFocus: false // Prevent unnecessary refetches
  });

  return {
    cotizaciones: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    isFetching: queryResult.isFetching
  };
};

export default useCotizaciones;
