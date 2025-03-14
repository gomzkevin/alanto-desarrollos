
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Lead = Tables<"leads">;

type FetchLeadsOptions = {
  estado?: string;
  agente?: string;
  limit?: number;
  search?: string;
};

export const useLeads = (options: FetchLeadsOptions = {}) => {
  const { estado, agente, limit, search } = options;
  
  // Function to fetch leads
  const fetchLeads = async () => {
    console.log('Fetching leads with options:', options);
    
    try {
      let query = supabase
        .from('leads')
        .select('*');
        
      // Apply filters
      if (estado) {
        query = query.eq('estado', estado);
      }
      
      if (agente) {
        query = query.eq('agente', agente);
      }
      
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      // Order by fecha_creacion descending
      query = query.order('fecha_creacion', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching leads:', error);
        throw new Error(error.message);
      }
      
      console.log('Leads fetched:', data);
      return data as Lead[];
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['leads', estado, agente, limit, search],
    queryFn: fetchLeads
  });

  return {
    leads: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
};

export default useLeads;
