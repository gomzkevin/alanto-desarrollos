
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Unidad = Tables<"unidades">;

type FetchUnidadesOptions = {
  prototipo_id?: string;
  estado?: string;
};

type UnidadesCountByStatus = {
  vendidas: number;
  con_anticipo: number;
  disponibles: number;
  total: number;
};

export const useUnidades = (options: FetchUnidadesOptions = {}) => {
  const { prototipo_id, estado } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Función para obtener unidades
  const fetchUnidades = async (): Promise<Unidad[]> => {
    try {
      console.log('Fetching unidades with options:', options);
      
      let query = supabase.from('unidades').select('*');
      
      if (prototipo_id) {
        query = query.eq('prototipo_id', prototipo_id);
      }
      
      if (estado) {
        query = query.eq('estado', estado);
      }
      
      const { data, error } = await query.order('numero', { ascending: true });
      
      if (error) {
        console.error('Error fetchUnidades:', error);
        throw new Error(error.message);
      }
      
      console.log('Unidades fetched:', data);
      return data;
    } catch (error) {
      console.error('Error en fetchUnidades:', error);
      throw error;
    }
  };
  
  // Función para contar unidades por estado para un prototipo específico
  const countUnidadesByStatus = async (prototipoId: string): Promise<UnidadesCountByStatus> => {
    try {
      const { data, error } = await supabase
        .from('unidades')
        .select('estado')
        .eq('prototipo_id', prototipoId);
        
      if (error) throw error;
      
      const counts = {
        vendidas: data.filter(u => u.estado === 'vendido').length,
        con_anticipo: data.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso').length,
        disponibles: data.filter(u => u.estado === 'disponible').length,
        total: data.length
      };
      
      return counts;
    } catch (error) {
      console.error('Error counting unidades by status:', error);
      throw error;
    }
  };
  
  // Query para obtener unidades
  const unidadesQuery = useQuery({
    queryKey: ['unidades', prototipo_id, estado],
    queryFn: fetchUnidades
  });
  
  // Mutación para crear una nueva unidad
  const createUnidad = useMutation({
    mutationFn: async (unidad: Omit<Unidad, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('unidades')
        .insert(unidad)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      // Also invalidate the prototipos query to update counts
      queryClient.invalidateQueries({ queryKey: ['prototipos'] });
      toast({
        title: 'Unidad creada',
        description: 'La unidad ha sido creada correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al crear la unidad: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutación para actualizar una unidad existente
  const updateUnidad = useMutation({
    mutationFn: async ({ id, ...unidad }: Partial<Unidad> & { id: string }) => {
      const { data, error } = await supabase
        .from('unidades')
        .update(unidad)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      // Also invalidate the prototipos query to update counts
      queryClient.invalidateQueries({ queryKey: ['prototipos'] });
      toast({
        title: 'Unidad actualizada',
        description: 'La unidad ha sido actualizada correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al actualizar la unidad: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutación para eliminar una unidad
  const deleteUnidad = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('unidades')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      // Also invalidate the prototipos query to update counts
      queryClient.invalidateQueries({ queryKey: ['prototipos'] });
      toast({
        title: 'Unidad eliminada',
        description: 'La unidad ha sido eliminada correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al eliminar la unidad: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Crear varias unidades a la vez (útil para inicializar un prototipo)
  const createMultipleUnidades = useMutation({
    mutationFn: async ({ 
      prototipo_id, 
      cantidad, 
      prefijo = '' 
    }: { 
      prototipo_id: string; 
      cantidad: number; 
      prefijo?: string; 
    }) => {
      const unidades = Array.from({ length: cantidad }, (_, i) => ({
        prototipo_id,
        numero: `${prefijo}${i + 1}`,
        estado: 'disponible'
      }));
      
      const { data, error } = await supabase
        .from('unidades')
        .insert(unidades)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      // Also invalidate the prototipos query to update counts
      queryClient.invalidateQueries({ queryKey: ['prototipos'] });
      toast({
        title: 'Unidades creadas',
        description: 'Las unidades han sido creadas correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Error al crear las unidades: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    unidades: unidadesQuery.data || [],
    isLoading: unidadesQuery.isLoading,
    error: unidadesQuery.error,
    refetch: unidadesQuery.refetch,
    createUnidad,
    updateUnidad,
    deleteUnidad,
    createMultipleUnidades,
    countUnidadesByStatus
  };
};

export default useUnidades;
