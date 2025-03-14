
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Lead = Tables<"leads">;

type FetchLeadsOptions = {
  limit?: number;
  filters?: Record<string, any>;
};

export const useLeads = (options: FetchLeadsOptions = {}) => {
  const { limit, filters = {} } = options;
  
  // Function to fetch leads
  const fetchLeads = async () => {
    console.log('Fetching leads with options:', options);
    
    try {
      let query = supabase
        .from('leads')
        .select('*');
        
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
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching leads:', error);
        throw new Error(error.message);
      }
      
      console.log('Leads fetched:', data);
      return data || [];
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      return [];
    }
  };

  // Use React Query to fetch and cache the data
  const { 
    data: leads, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['leads', limit, JSON.stringify(filters)],
    queryFn: fetchLeads
  });

  return {
    leads: (leads || []) as Lead[],
    isLoading,
    error,
    refetch
  };
};

export default useLeads;
