
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import useUserRole from '@/hooks/useUserRole';

export type Cotizacion = Tables<"cotizaciones">;

// Define basic types without circular references
export type ExtendedCotizacion = Cotizacion & {
  lead?: {
    id: string;
    nombre: string;
    email?: string | null;
    telefono?: string | null;
    origen?: string | null;
  } | null;
  desarrollo?: {
    id: string;
    nombre: string;
    ubicacion?: string | null;
  } | null;
  prototipo?: {
    id: string;
    nombre: string;
    precio: number;
  } | null;
  // These fields are now part of the database schema
  fecha_inicio_pagos?: string | null;
  fecha_finiquito?: string | null;
};

type FetchCotizacionesOptions = {
  limit?: number;
  withRelations?: boolean;
  empresa_id?: number | null;
};

export const useCotizaciones = (options: FetchCotizacionesOptions = {}) => {
  const { limit, withRelations = false, empresa_id } = options;
  const { empresaId: userEmpresaId } = useUserRole();
  
  // Use the specified empresa_id or fall back to the user's empresa_id
  const effectiveEmpresaId = empresa_id !== undefined ? empresa_id : userEmpresaId;
  
  // Function to fetch cotizaciones with simplified types to prevent recursion
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    console.log('Fetching cotizaciones with options:', {...options, effectiveEmpresaId});
    
    try {
      // Build the basic query
      let query = supabase.from('cotizaciones').select('*');
      
      // Filter by empresa_id if provided
      if (effectiveEmpresaId) {
        query = query.eq('empresa_id', effectiveEmpresaId);
        console.log('Filtering cotizaciones by empresa_id:', effectiveEmpresaId);
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
      
      if (!cotizaciones || cotizaciones.length === 0) {
        return [];
      }
      
      // If relations are requested and we have cotizaciones, fetch related entities
      if (withRelations) {
        const extendedCotizaciones: ExtendedCotizacion[] = [...cotizaciones];
        
        // Get all unique IDs for related entities
        const leadIds = cotizaciones
          .map(c => c.lead_id)
          .filter((id): id is string => id !== null && id !== undefined);
          
        const desarrolloIds = cotizaciones
          .map(c => c.desarrollo_id)
          .filter((id): id is string => id !== null && id !== undefined);
          
        const prototipoIds = cotizaciones
          .map(c => c.prototipo_id)
          .filter((id): id is string => id !== null && id !== undefined);
        
        // Fetch leads if needed
        if (leadIds.length > 0) {
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, nombre, email, telefono, origen')
            .in('id', leadIds);
            
          if (leadsError) {
            console.error('Error fetching leads:', leadsError);
          } else if (leads) {
            extendedCotizaciones.forEach(cotizacion => {
              cotizacion.lead = leads.find(l => l.id === cotizacion.lead_id) || null;
            });
          }
        }
        
        // Fetch desarrollos if needed
        if (desarrolloIds.length > 0) {
          const { data: desarrollos, error: desarrollosError } = await supabase
            .from('desarrollos')
            .select('id, nombre, ubicacion')
            .in('id', desarrolloIds);
            
          if (desarrollosError) {
            console.error('Error fetching desarrollos:', desarrollosError);
          } else if (desarrollos) {
            extendedCotizaciones.forEach(cotizacion => {
              cotizacion.desarrollo = desarrollos.find(d => d.id === cotizacion.desarrollo_id) || null;
            });
          }
        }
        
        // Fetch prototipos if needed
        if (prototipoIds.length > 0) {
          const { data: prototipos, error: prototipossError } = await supabase
            .from('prototipos')
            .select('id, nombre, precio')
            .in('id', prototipoIds);
            
          if (prototipossError) {
            console.error('Error fetching prototipos:', prototipossError);
          } else if (prototipos) {
            extendedCotizaciones.forEach(cotizacion => {
              cotizacion.prototipo = prototipos.find(p => p.id === cotizacion.prototipo_id) || null;
            });
          }
        }
        
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
    queryKey: ['cotizaciones', limit, withRelations, effectiveEmpresaId],
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
