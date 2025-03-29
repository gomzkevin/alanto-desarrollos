
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
    
    if (!empresaId) {
      console.log('No empresaId available, returning empty array');
      return [];
    }
    
    try {
      // First, get desarrollos for the empresa to ensure correct filtering
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
      console.log('Filtering cotizaciones by desarrollo_ids:', desarrolloIds);
      
      // Now fetch cotizaciones filtered by those desarrollo_ids
      let query = supabase
        .from('cotizaciones')
        .select(`
          *,
          desarrollo:desarrollos(*),
          prototipo:prototipos(*)
        `)
        .in('desarrollo_id', desarrolloIds);
      
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
        
        // Fetch all related entities in batch queries
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .in('id', leadIds);
        
        if (leadsError) {
          console.error('Error fetching leads:', leadsError);
        }
        
        // Map related entities to cotizaciones
        const extendedCotizaciones: ExtendedCotizacion[] = cotizaciones.map(cotizacion => {
          return {
            ...cotizacion,
            lead: leads?.find(l => l.id === cotizacion.lead_id) || null
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
