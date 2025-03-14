
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Cotizacion = Tables<"cotizaciones">;

// Define basic types without circular references
export type ExtendedCotizacion = Cotizacion & {
  lead?: Tables<"leads"> | null;
  desarrollo?: Tables<"desarrollos"> | null;
  prototipo?: Tables<"prototipos"> | null;
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
        const extendedCotizaciones: ExtendedCotizacion[] = await Promise.all(
          cotizaciones.map(async (cotizacion) => {
            // Fetch lead relation
            const { data: lead, error: leadError } = await supabase
              .from('leads')
              .select('*')
              .eq('id', cotizacion.lead_id)
              .maybeSingle();
            
            // Fetch desarrollo relation
            const { data: desarrollo, error: desarrolloError } = await supabase
              .from('desarrollos')
              .select('*')
              .eq('id', cotizacion.desarrollo_id)
              .maybeSingle();
            
            // Fetch prototipo relation
            const { data: prototipo, error: prototipoError } = await supabase
              .from('prototipos')
              .select('*')
              .eq('id', cotizacion.prototipo_id)
              .maybeSingle();
            
            return {
              ...cotizacion,
              lead: leadError ? null : lead,
              desarrollo: desarrolloError ? null : desarrollo,
              prototipo: prototipoError ? null : prototipo
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
