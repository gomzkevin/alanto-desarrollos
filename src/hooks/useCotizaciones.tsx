
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useUserRole } from './useUserRole';

export type Cotizacion = Tables<"cotizaciones">;

// Define basic types without circular references
export type ExtendedCotizacion = Cotizacion & {
  lead?: Tables<"leads"> | null;
  desarrollo?: Tables<"desarrollos"> | null;
  prototipo?: Tables<"prototipos"> | null;
  // These fields are now part of the database schema
  fecha_inicio_pagos?: string | null;
  fecha_finiquito?: string | null;
};

type FetchCotizacionesOptions = {
  limit?: number;
  withRelations?: boolean;
};

export const useCotizaciones = (options: FetchCotizacionesOptions = {}) => {
  const { limit, withRelations = false } = options;
  const { empresaId } = useUserRole();
  
  console.log('useCotizaciones initialized with empresaId:', empresaId);
  
  // Function to fetch cotizaciones
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    console.log('Fetching cotizaciones with options:', options, 'empresaId:', empresaId);
    
    try {
      // Build the basic query
      let query = supabase
        .from('cotizaciones')
        .select(`
          *,
          desarrollo:desarrollos(*)
        `);
      
      // Filter by empresa_id of the user if available
      if (empresaId) {
        // Join with desarrollos to filter by empresa_id
        query = query.eq('desarrollo.empresa_id', empresaId);
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
      
      // If relations are requested, fetch them for each cotizacion
      if (withRelations && cotizaciones && cotizaciones.length > 0) {
        // Get all unique IDs for related entities
        const leadIds = [...new Set(cotizaciones.map(c => c.lead_id).filter(Boolean))];
        const prototipoIds = [...new Set(cotizaciones.map(c => c.prototipo_id).filter(Boolean))];
        
        // Fetch all related entities in batch queries
        const [leadsResponse, prototipesResponse] = await Promise.all([
          leadIds.length > 0 ? supabase.from('leads').select('*').in('id', leadIds) : { data: [], error: null },
          prototipoIds.length > 0 ? supabase.from('prototipos').select('*').in('id', prototipoIds) : { data: [], error: null }
        ]);
        
        const leads = leadsResponse.error ? [] : leadsResponse.data;
        const prototipos = prototipesResponse.error ? [] : prototipesResponse.data;
        
        // Map related entities to cotizaciones
        const extendedCotizaciones: ExtendedCotizacion[] = cotizaciones.map(cotizacion => {
          return {
            ...cotizacion,
            lead: leads.find(l => l.id === cotizacion.lead_id) || null,
            prototipo: prototipos.find(p => p.id === cotizacion.prototipo_id) || null
          };
        });
        
        console.log('Extended cotizaciones fetched:', extendedCotizaciones.length, 'results');
        return extendedCotizaciones;
      }
      
      console.log('Cotizaciones fetched:', cotizaciones?.length || 0, 'results');
      return cotizaciones as ExtendedCotizacion[] || [];
    } catch (error) {
      console.error('Error in fetchCotizaciones:', error);
      // Return empty array instead of throwing to avoid error screen
      return [];
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['cotizaciones', limit, withRelations, empresaId],
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
