
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useUserRole } from './useUserRole';

export type Cotizacion = Tables<"cotizaciones">;

// Define basic types without circular references
export interface ExtendedCotizacion extends Omit<Cotizacion, 'fecha_finiquito' | 'fecha_inicio_pagos' | 'monto_finiquito' | 'usar_finiquito' | 'notas'> {
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
    empresa_id: number;
    ubicacion?: string | null;
  } | null;
  prototipo?: {
    id: string;
    nombre: string;
    precio: number;
  } | null;
  // These fields are now declared with their proper optional types
  fecha_inicio_pagos?: string | null;
  fecha_finiquito?: string | null;
  monto_finiquito?: number | null;
  usar_finiquito?: boolean | null;
  notas?: string | null;
  // Additional calculated properties
  monto_total?: number;
  estado?: string;
}

type FetchCotizacionesOptions = {
  limit?: number;
  withRelations?: boolean;
  empresa_id?: number;
};

export const useCotizaciones = (options: FetchCotizacionesOptions = {}) => {
  const { limit, withRelations = false } = options;
  // Always call hooks at the top level, regardless of conditions
  const { empresaId } = useUserRole();
  
  // Function to fetch cotizaciones
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    console.log('Fetching cotizaciones with options:', options, 'for empresa:', empresaId);
    
    // Use provided empresa_id or fall back to the user's empresaId
    const effectiveEmpresaId = options.empresa_id || empresaId;
    
    try {
      // Build the basic query - we don't filter by empresa_id here since cotizaciones table doesn't have it
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
      
      // If no cotizaciones or no empresa_id, return empty array or all cotizaciones
      if (!cotizaciones || cotizaciones.length === 0 || !effectiveEmpresaId) {
        console.log('No cotizaciones found or no empresa ID');
        return cotizaciones as ExtendedCotizacion[] || [];
      }
      
      // If relations are requested, fetch them for each cotizacion
      if (withRelations) {
        // Get all unique IDs for related entities
        const leadIds = [...new Set(cotizaciones.map(c => c.lead_id).filter(Boolean))];
        const desarrolloIds = [...new Set(cotizaciones.map(c => c.desarrollo_id).filter(Boolean))];
        const prototipoIds = [...new Set(cotizaciones.map(c => c.prototipo_id).filter(Boolean))];
        
        // Fetch all related entities in batch queries
        const [leadsResponse, desarrollosResponse, prototipesResponse] = await Promise.all([
          supabase.from('leads').select('id, nombre, email, telefono, origen').in('id', leadIds),
          supabase.from('desarrollos').select('id, nombre, empresa_id, ubicacion').in('id', desarrolloIds),
          supabase.from('prototipos').select('id, nombre, precio').in('id', prototipoIds)
        ]);
        
        const leads = leadsResponse.error ? [] : leadsResponse.data;
        const desarrollos = desarrollosResponse.error ? [] : desarrollosResponse.data;
        const prototipos = prototipesResponse.error ? [] : prototipesResponse.data;
        
        // Filter cotizaciones that belong to the user's empresa
        // We do this by filtering desarrollos by empresa_id
        const empresaDesarrolloIds = desarrollos
          .filter(d => d.empresa_id === effectiveEmpresaId)
          .map(d => d.id);
        
        // Only include cotizaciones whose desarrollo_id is in empresaDesarrolloIds
        const filteredCotizaciones = cotizaciones.filter(
          cotizacion => empresaDesarrolloIds.includes(cotizacion.desarrollo_id)
        );
        
        console.log('Filtered cotizaciones by empresa:', filteredCotizaciones.length);
        
        // Map related entities to cotizaciones and add calculated fields
        const extendedCotizaciones = filteredCotizaciones.map(cotizacion => {
          const prototipo = prototipos.find(p => p.id === cotizacion.prototipo_id);
          const monto_total = prototipo ? prototipo.precio : 0;
          
          return {
            ...cotizacion,
            lead: leads.find(l => l.id === cotizacion.lead_id) || null,
            desarrollo: desarrollos.find(d => d.id === cotizacion.desarrollo_id) || null,
            prototipo: prototipo || null,
            monto_total: monto_total,
            estado: 'pendiente' // Default status
          } as ExtendedCotizacion;
        });
        
        console.log('Extended cotizaciones fetched:', extendedCotizaciones.length);
        return extendedCotizaciones;
      }
      
      // If not requesting relations, we still need to filter by empresa_id
      // So we need to fetch the desarrollos first to get the empresa_id
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select('id, empresa_id')
        .eq('empresa_id', effectiveEmpresaId);
      
      if (desarrollosError) {
        console.error('Error fetching desarrollos:', desarrollosError);
        return [] as ExtendedCotizacion[];
      }
      
      const empresaDesarrolloIds = desarrollos.map(d => d.id);
      
      // Filter cotizaciones by desarrollo_id
      const filteredCotizaciones = cotizaciones.filter(
        cotizacion => empresaDesarrolloIds.includes(cotizacion.desarrollo_id)
      );
      
      console.log('Cotizaciones filtered by empresa:', filteredCotizaciones.length);
      
      // Add basic calculated fields for the table view
      const extendedCotizaciones = filteredCotizaciones.map(cotizacion => ({
        ...cotizacion,
        monto_total: 0, // This will be populated when relations are fetched
        estado: 'pendiente' // Default status
      })) as ExtendedCotizacion[];
      
      return extendedCotizaciones;
    } catch (error) {
      console.error('Error in fetchCotizaciones:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['cotizaciones', limit, withRelations, options.empresa_id, empresaId],
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
