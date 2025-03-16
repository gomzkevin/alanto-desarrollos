import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Cotizacion = Tables<"cotizaciones">;

// Define basic types without circular references
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
};

export const useCotizaciones = (options: FetchCotizacionesOptions = {}) => {
  const { limit, withRelations = false } = options;
  
  // Function to fetch cotizaciones
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    console.log('Fetching cotizaciones with options:', options);
    
    try {
      // Build the basic query
      let query = supabase.from('cotizaciones').select('*');
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: cotizaciones, error } = await query;
      
      if (error) {
        console.error('Error fetching cotizaciones:', error);
        throw new Error(error.message);
      }
      
      // If relations are requested, fetch them for each cotizacion
      if (withRelations && cotizaciones && cotizaciones.length > 0) {
        // Get all unique IDs for related entities
        const leadIds = [...new Set(cotizaciones.map(c => c.lead_id))];
        const desarrolloIds = [...new Set(cotizaciones.map(c => c.desarrollo_id))];
        const prototipoIds = [...new Set(cotizaciones.map(c => c.prototipo_id))];
        
        // Fetch all related entities in batch queries
        const [leadsResponse, desarrollosResponse, prototipesResponse] = await Promise.all([
          supabase.from('leads').select('*').in('id', leadIds),
          supabase.from('desarrollos').select('*').in('id', desarrolloIds),
          supabase.from('prototipos').select('*').in('id', prototipoIds)
        ]);
        
        const leads = leadsResponse.error ? [] : leadsResponse.data;
        const desarrollos = desarrollosResponse.error ? [] : desarrollosResponse.data;
        const prototipos = prototipesResponse.error ? [] : prototipesResponse.data;
        
        // Map related entities to cotizaciones
        const extendedCotizaciones: ExtendedCotizacion[] = cotizaciones.map(cotizacion => {
          return {
            ...cotizacion,
            lead: leads.find(l => l.id === cotizacion.lead_id) || null,
            desarrollo: desarrollos.find(d => d.id === cotizacion.desarrollo_id) || null,
            prototipo: prototipos.find(p => p.id === cotizacion.prototipo_id) || null
          };
        });
        
        console.log('Extended cotizaciones fetched:', extendedCotizaciones);
        return extendedCotizaciones;
      }
      
      console.log('Cotizaciones fetched:', cotizaciones);
      return cotizaciones as ExtendedCotizacion[];
    } catch (error) {
      console.error('Error in fetchCotizaciones:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['cotizaciones', limit, withRelations],
    queryFn: fetchCotizaciones
  });

  return {
    cotizaciones: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
};

export default useCotizaciones;
