
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Define the Cotizacion type using Supabase generated types
export type Cotizacion = Tables<"cotizaciones">;

// Define types for relations but avoid circular references
export type ExtendedCotizacion = Cotizacion & {
  lead?: Tables<"leads"> | null;
  desarrollo?: Tables<"desarrollos"> | null;
  prototipo?: Tables<"prototipos"> | null;
};

type FetchCotizacionesOptions = {
  leadId?: string;
  desarrolloId?: string;
  limit?: number;
  filters?: Record<string, any>;
  withRelations?: boolean;
};

export const useCotizaciones = (options: FetchCotizacionesOptions = {}) => {
  const { leadId, desarrolloId, limit, filters = {}, withRelations = true } = options;
  
  // Function to fetch cotizaciones
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    console.log('Fetching cotizaciones with options:', options);
    
    try {
      // Build the query
      let query = supabase.from('cotizaciones').select('*');
      
      // Filter by lead_id if provided
      if (leadId) {
        query = query.eq('lead_id', leadId);
      }
      
      // Filter by desarrollo_id if provided
      if (desarrolloId) {
        query = query.eq('desarrollo_id', desarrolloId);
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      // Apply filters if any
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      // Order by created_at descending
      query = query.order('created_at', { ascending: false });
      
      const { data: cotizaciones, error } = await query;
      
      if (error) {
        console.error('Error fetching cotizaciones:', error);
        throw new Error(error.message);
      }
      
      // If relations are requested, fetch them for each cotizacion
      if (withRelations && cotizaciones && cotizaciones.length > 0) {
        const extendedCotizaciones: ExtendedCotizacion[] = await Promise.all(
          cotizaciones.map(async (cotizacion) => {
            // Fetch associated relations
            const leadPromise = supabase.from('leads').select('*').eq('id', cotizacion.lead_id).single();
            const desarrolloPromise = supabase.from('desarrollos').select('*').eq('id', cotizacion.desarrollo_id).single();
            const prototipoPromise = supabase.from('prototipos').select('*').eq('id', cotizacion.prototipo_id).single();
            
            const [leadResult, desarrolloResult, prototipoResult] = await Promise.all([
              leadPromise,
              desarrolloPromise,
              prototipoPromise
            ]);
            
            return {
              ...cotizacion,
              lead: leadResult.error ? null : leadResult.data,
              desarrollo: desarrolloResult.error ? null : desarrolloResult.data,
              prototipo: prototipoResult.error ? null : prototipoResult.data
            };
          })
        );
        
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
    queryKey: ['cotizaciones', leadId, desarrolloId, limit, JSON.stringify(filters), withRelations],
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
