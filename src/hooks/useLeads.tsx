import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface Lead {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  estado: string | null;
  subestado: string | null;
  origen: string | null;
  interes_en: string | null;
  notas: string | null;
  agente: string | null;
  ultimo_contacto: string | null;
  fecha_creacion: string | null;
  empresa_id: number | null;
}

interface UseLeadsOptions {
  search?: string;
  estado?: string;
  origen?: string;
  limit?: number;
  onSuccess?: (data: Lead[]) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_OPTIONS: UseLeadsOptions = {
  onSuccess: () => {},
  onError: () => {}
};

export const useLeads = (options: UseLeadsOptions = DEFAULT_OPTIONS) => {
  const { empresaId } = useUserRole();
  const queryClient = useQueryClient();
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { search, estado, origen, limit } = mergedOptions;
  
  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leads', empresaId, search, estado, origen, limit],
    queryFn: async () => {
      try {
        let query = supabase
          .from('leads')
          .select('*')
          .eq('empresa_id', empresaId)
          .order('fecha_creacion', { ascending: false });
        
        if (search) {
          query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
        }
        
        if (estado) {
          query = query.eq('estado', estado);
        }
        
        if (origen) {
          query = query.eq('origen', origen);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data as Lead[];
      } catch (error: any) {
        console.error('Error fetching leads:', error);
        throw new Error(error.message);
      }
    },
    enabled: !!empresaId,
    ...mergedOptions
  });
  
  const createLead = useMutation({
    mutationFn: async (newLead: Omit<Lead, 'id' | 'fecha_creacion'>) => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert([{ ...newLead, empresa_id: empresaId }])
          .select()
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        return data as Lead;
      } catch (error: any) {
        console.error('Error creating lead:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead creado",
        description: "El lead se ha creado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo crear el lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateLead = useMutation({
    mutationFn: async (lead: Lead) => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .update(lead)
          .eq('id', lead.id)
          .select()
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        return data as Lead;
      } catch (error: any) {
        console.error('Error updating lead:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead actualizado",
        description: "El lead se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', id);
          
        if (error) {
          throw new Error(error.message);
        }
        
        return id;
      } catch (error: any) {
        console.error('Error deleting lead:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead eliminado",
        description: "El lead se ha eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    leads,
    isLoading,
    error,
    refetch,
    createLead,
    updateLead,
    deleteLead
  };
};

export default useLeads;
export type { Lead };
