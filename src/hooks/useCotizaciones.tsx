
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useUserRole } from './useUserRole';

export type Cotizacion = Tables<"cotizaciones">;

// Define simplified types without circular references
export type SimpleLead = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  origen: string;
};

export type SimpleDesarrollo = {
  id: string;
  nombre: string;
  ubicacion: string;
};

export type SimplePrototipo = {
  id: string;
  nombre: string;
  precio: number;
};

// Define extended cotizacion with simple related types
export type ExtendedCotizacion = Cotizacion & {
  lead?: SimpleLead | null;
  desarrollo?: SimpleDesarrollo | null;
  prototipo?: SimplePrototipo | null;
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
  // Always call hooks at the top level, regardless of conditions
  const { empresaId } = useUserRole();
  
  // Function to fetch cotizaciones
  const fetchCotizaciones = async (): Promise<ExtendedCotizacion[]> => {
    console.log('Fetching cotizaciones with options:', options, 'for empresa:', empresaId);
    
    try {
      // Build the basic query
      let query = supabase.from('cotizaciones').select('*');
      
      // Filter by empresa_id if it exists
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
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
        const desarrolloIds = [...new Set(cotizaciones.map(c => c.desarrollo_id).filter(Boolean))];
        const prototipoIds = [...new Set(cotizaciones.map(c => c.prototipo_id).filter(Boolean))];
        
        // Fetch all related entities in batch queries
        const [leadsResponse, desarrollosResponse, prototipesResponse] = await Promise.all([
          leadIds.length > 0 ? supabase.from('leads').select('id, nombre, email, telefono, origen').in('id', leadIds) : { data: [], error: null },
          desarrolloIds.length > 0 ? supabase.from('desarrollos').select('id, nombre, ubicacion').in('id', desarrolloIds) : { data: [], error: null },
          prototipoIds.length > 0 ? supabase.from('prototipos').select('id, nombre, precio').in('id', prototipoIds) : { data: [], error: null }
        ]);
        
        const leads = leadsResponse.error ? [] : leadsResponse.data;
        const desarrollos = desarrollosResponse.error ? [] : desarrollosResponse.data;
        const prototipos = prototipesResponse.error ? [] : prototipesResponse.data;
        
        // Map related entities to cotizaciones
        const extendedCotizaciones = cotizaciones.map(cotizacion => {
          return {
            ...cotizacion,
            lead: leads.find(l => l.id === cotizacion.lead_id) || null,
            desarrollo: desarrollos.find(d => d.id === cotizacion.desarrollo_id) || null,
            prototipo: prototipos.find(p => p.id === cotizacion.prototipo_id) || null
          } as ExtendedCotizacion;  // Use type assertion here to avoid deep instantiation
        });
        
        console.log('Extended cotizaciones fetched:', extendedCotizaciones);
        return extendedCotizaciones;
      }
      
      console.log('Cotizaciones fetched:', cotizaciones);
      return cotizaciones as ExtendedCotizacion[];  // Use type assertion here
    } catch (error) {
      console.error('Error in fetchCotizaciones:', error);
      throw error;
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
