
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import { useCallback } from 'react';
import { useDesarrollos } from './desarrollos';

export type Lead = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  estado: string;
  subestado: string;
  origen: string;
  interes_en: string;
  notas: string;
  fecha_creacion: string;
  ultimo_contacto: string;
  agente: string;
  empresa_id: number;
};

type FetchLeadsOptions = {
  estado?: string;
  desarrolloId?: string;
  sortBy?: 'fecha_creacion' | 'nombre';
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  limit?: number;
};

export const useLeads = (options: FetchLeadsOptions = {}) => {
  const { 
    estado, 
    desarrolloId, 
    sortBy = 'fecha_creacion', 
    sortOrder = 'desc',
    searchTerm = '',
    limit
  } = options;
  
  const { empresaId } = useUserRole();
  
  const fetchLeads = useCallback(async (): Promise<Lead[]> => {
    if (!empresaId) return [];
    
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('empresa_id', empresaId);
      
      if (estado) {
        query = query.eq('estado', estado);
      }
      
      if (desarrolloId) {
        query = query.eq('interes_en', desarrolloId);
      }
      
      if (searchTerm) {
        query = query.or(`nombre.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,telefono.ilike.%${searchTerm}%`);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      let { data, error } = await query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      if (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
      
      return data as Lead[];
    } catch (error) {
      console.error('Unexpected error in useLeads:', error);
      return [];
    }
  }, [empresaId, estado, desarrolloId, sortBy, sortOrder, searchTerm, limit]);
  
  const query = useQuery({
    queryKey: ['leads', empresaId, estado, desarrolloId, sortBy, sortOrder, searchTerm, limit],
    queryFn: fetchLeads,
    enabled: !!empresaId
  });
  
  return {
    leads: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};

export default useLeads;
