
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { Tables } from '@/integrations/supabase/types';

export type Desarrollo = Tables<'desarrollos'>;

interface UseDesarrollosOptions {
  empresa_id?: number;
  onSuccess?: (data: Desarrollo[]) => void;
  onError?: (error: Error) => void;
}

export const useDesarrollos = (options: UseDesarrollosOptions = {}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { empresaId } = useUserRole();

  const fetchDesarrollos = async (): Promise<Desarrollo[]> => {
    try {
      let query = supabase
        .from('desarrollos')
        .select('*')
        .order('nombre', { ascending: true });

      if (options.empresa_id) {
        query = query.eq('empresa_id', options.empresa_id);
      } else if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener desarrollos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching desarrollos:', error);
      return [];
    }
  };

  const { data: desarrollos, isLoading, error, refetch } = useQuery({
    queryKey: ['desarrollos', options.empresa_id, empresaId],
    queryFn: fetchDesarrollos,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
    onSuccess: options.onSuccess,
    onError: options.onError
  });

  // Fix create function to handle field type issues
  const createDesarrollo = async (desarrolloData: Partial<Desarrollo>) => {
    setIsCreating(true);
    
    try {
      // Remove fields that don't exist in the database schema
      const { latitud, longitud, estado, fecha_finalizacion_estimada, ...validData } = desarrolloData as any;
      
      // Ensure required fields have default values if not provided
      const dataToInsert = {
        ...validData,
        empresa_id: options.empresa_id || empresaId || 1,
        total_unidades: validData.total_unidades || 0,
        unidades_disponibles: validData.unidades_disponibles || 0,
        fecha_inicio: validData.fecha_inicio || new Date().toISOString(),
        fecha_entrega: validData.fecha_entrega || null
      };
      
      const { data, error } = await supabase
        .from('desarrollos')
        .insert(dataToInsert)
        .select();
        
      if (error) throw error;
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Error al crear desarrollo:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateDesarrollo = async (id: string, updates: Partial<Desarrollo>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('desarrollos')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      await refetch();
      return data;
    } catch (error) {
      console.error('Error al actualizar desarrollo:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteDesarrollo = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('desarrollos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refetch();
    } catch (error) {
      console.error('Error al eliminar desarrollo:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    desarrollos: desarrollos || [],
    isLoading,
    error,
    refetch,
    createDesarrollo,
    updateDesarrollo,
    deleteDesarrollo,
    isCreating,
    isUpdating,
    isDeleting
  };
};

export default useDesarrollos;
