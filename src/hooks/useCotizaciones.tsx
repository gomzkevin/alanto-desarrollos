
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define the Cotizacion type
export type Cotizacion = {
  id: string;
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito: boolean;
  monto_finiquito?: number;
  notas?: string;
  created_at: string;
  // Include joined data
  lead?: any;
  desarrollo?: any;
  prototipo?: any;
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
  const fetchCotizaciones = async () => {
    console.log('Fetching cotizaciones with options:', options);
    
    try {
      // Build the select query with optional relations
      const selectQuery = withRelations 
        ? `*, lead:lead_id(*), desarrollo:desarrollo_id(*), prototipo:prototipo_id(*)`
        : '*';
      
      let query = supabase
        .from('cotizaciones')
        .select(selectQuery);
        
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
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching cotizaciones:', error);
        throw new Error(error.message);
      }
      
      console.log('Cotizaciones fetched:', data);
      return data as Cotizacion[];
    } catch (error) {
      console.error('Error in fetchCotizaciones:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const { 
    data: cotizaciones, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['cotizaciones', leadId, desarrolloId, limit, JSON.stringify(filters), withRelations],
    queryFn: fetchCotizaciones
  });

  return {
    cotizaciones: cotizaciones || [],
    isLoading,
    error,
    refetch
  };
};

export default useCotizaciones;
