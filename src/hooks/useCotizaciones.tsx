import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import useUserRole from '@/hooks/useUserRole';
import useSupabaseTableHelpers from './useSupabaseTableHelpers';
import { SimplifiedLead, SimplifiedDesarrollo, SimplifiedPrototipo, ExtendedCotizacion } from './types/venta.types';

export type Cotizacion = Tables<"cotizaciones">;

type FetchCotizacionesOptions = {
  limit?: number;
  withRelations?: boolean;
  empresa_id?: number | null;
};

export const useCotizaciones = (options: FetchCotizacionesOptions = {}) => {
  const { limit, withRelations = false, empresa_id } = options;
  const { empresaId: userEmpresaId } = useUserRole();
  const { hasColumn } = useSupabaseTableHelpers();
  
  // Use the specified empresa_id or fall back to the user's empresa_id
  const effectiveEmpresaId = empresa_id !== undefined ? empresa_id : userEmpresaId;
  
  // Function to fetch cotizaciones with simplified types to prevent recursion
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    console.log('Fetching cotizaciones with options:', {...options, effectiveEmpresaId});
    
    try {
      // Check if empresa_id column exists
      const hasEmpresaColumn = await hasColumn('cotizaciones', 'empresa_id');
      
      // Build the basic query
      let query = supabase.from('cotizaciones').select('*');
      
      // Filter by empresa_id if provided and column exists
      if (effectiveEmpresaId && hasEmpresaColumn) {
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
        return [];
      }
      
      if (!cotizaciones || cotizaciones.length === 0) {
        return [];
      }
      
      // Map to our safe ExtendedCotizacion type
      const basicCotizaciones: ExtendedCotizacion[] = cotizaciones.map(c => {
        if (!c) return {
          id: '',
          created_at: '',
          desarrollo_id: '',
          lead_id: '',
          monto_anticipo: 0,
          numero_pagos: 0,
          prototipo_id: '',
        };
        
        return {
          id: c.id || '',
          created_at: c.created_at || '',
          desarrollo_id: c.desarrollo_id || '',
          fecha_finiquito: c.fecha_finiquito,
          fecha_inicio_pagos: c.fecha_inicio_pagos,
          lead_id: c.lead_id || '',
          monto_anticipo: c.monto_anticipo || 0,
          monto_finiquito: c.monto_finiquito,
          notas: c.notas,
          numero_pagos: c.numero_pagos || 0,
          prototipo_id: c.prototipo_id || '',
          usar_finiquito: c.usar_finiquito,
          empresa_id: 'empresa_id' in c ? (c.empresa_id as number | null) : null,
        };
      });
      
      // If relations are requested and we have cotizaciones, fetch related entities
      if (withRelations && basicCotizaciones.length > 0) {
        // Get all unique IDs for related entities
        const leadIds = basicCotizaciones
          .map(c => c.lead_id)
          .filter((id): id is string => Boolean(id));
          
        const desarrolloIds = basicCotizaciones
          .map(c => c.desarrollo_id)
          .filter((id): id is string => Boolean(id));
          
        const prototipoIds = basicCotizaciones
          .map(c => c.prototipo_id)
          .filter((id): id is string => Boolean(id));
        
        // Fetch leads if needed
        if (leadIds.length > 0) {
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id, nombre, email, telefono, origen')
            .in('id', leadIds);
            
          if (leadsError) {
            console.error('Error fetching leads:', leadsError);
          } else if (leads) {
            basicCotizaciones.forEach(cotizacion => {
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
            basicCotizaciones.forEach(cotizacion => {
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
            basicCotizaciones.forEach(cotizacion => {
              cotizacion.prototipo = prototipos.find(p => p.id === cotizacion.prototipo_id) || null;
            });
          }
        }
      }
      
      return basicCotizaciones;
    } catch (error) {
      console.error('Error in fetchCotizaciones:', error);
      return [];
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
