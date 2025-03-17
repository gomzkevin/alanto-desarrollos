
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
        // Ahora incluimos tanto 'apartado' como 'en_proceso' en el contador con_anticipo
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
  
  // Función para contar unidades por estado para un desarrollo completo
  const countDesarrolloUnidadesByStatus = async (desarrolloId: string): Promise<UnidadesCountByStatus> => {
    try {
      // Primero obtenemos todos los prototipos de este desarrollo
      const { data: prototipos, error: prototiposError } = await supabase
        .from('prototipos')
        .select('id')
        .eq('desarrollo_id', desarrolloId);
      
      if (prototiposError) throw prototiposError;
      
      if (!prototipos || prototipos.length === 0) {
        return {
          disponibles: 0,
          vendidas: 0,
          con_anticipo: 0,
          total: 0
        };
      }
      
      // Obtenemos todas las unidades de todos los prototipos de este desarrollo
      const prototipoIds = prototipos.map(p => p.id);
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('estado')
        .in('prototipo_id', prototipoIds);
      
      if (unidadesError) throw unidadesError;
      
      // Contamos por estado, incluyendo tanto 'apartado' como 'en_proceso' en con_anticipo
      const counts = {
        vendidas: unidades.filter(u => u.estado === 'vendido').length,
        con_anticipo: unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso').length,
        disponibles: unidades.filter(u => u.estado === 'disponible').length,
        total: unidades.length
      };
      
      return counts;
    } catch (error) {
      console.error('Error counting desarrollo unidades by status:', error);
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      
      // Actualizar contadores del prototipo
      if (data.prototipo_id) {
        await updatePrototipoUnidades(data.prototipo_id);
      }
      
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
      const { data: oldUnidad } = await supabase
        .from('unidades')
        .select('prototipo_id')
        .eq('id', id)
        .single();
        
      const { data, error } = await supabase
        .from('unidades')
        .update(unidad)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return { data, oldPrototipoId: oldUnidad?.prototipo_id };
    },
    onSuccess: async ({ data, oldPrototipoId }) => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      
      // Si cambió el prototipo, actualizar los contadores de ambos prototipos
      if (oldPrototipoId && data.prototipo_id !== oldPrototipoId) {
        await updatePrototipoUnidades(oldPrototipoId);
      }
      
      // Actualizar contadores del prototipo actual
      if (data.prototipo_id) {
        await updatePrototipoUnidades(data.prototipo_id);
      }
      
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
      const { data } = await supabase
        .from('unidades')
        .select('prototipo_id')
        .eq('id', id)
        .single();
        
      const prototipoId = data?.prototipo_id;
      
      const { error } = await supabase
        .from('unidades')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { id, prototipoId };
    },
    onSuccess: async ({ prototipoId }) => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      
      // Actualizar contadores del prototipo
      if (prototipoId) {
        await updatePrototipoUnidades(prototipoId);
      }
      
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      
      // Actualizar contadores del prototipo
      if (data.length > 0) {
        await updatePrototipoUnidades(data[0].prototipo_id);
      }
      
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

  // Función para actualizar los contadores de un prototipo basado en sus unidades
  const updatePrototipoUnidades = async (prototipoId: string) => {
    try {
      // Obtener los contadores actualizados
      const counts = await countUnidadesByStatus(prototipoId);
      
      // Actualizar el prototipo con los nuevos contadores
      await supabase
        .from('prototipos')
        .update({
          unidades_disponibles: counts.disponibles,
          unidades_vendidas: counts.vendidas,
          unidades_con_anticipo: counts.con_anticipo,
          total_unidades: counts.total
        })
        .eq('id', prototipoId);
      
      // Obtener el desarrollo_id del prototipo
      const { data: prototipo } = await supabase
        .from('prototipos')
        .select('desarrollo_id')
        .eq('id', prototipoId)
        .single();
      
      // Si existe el desarrollo, actualizar sus contadores
      if (prototipo && prototipo.desarrollo_id) {
        await updateDesarrolloUnidades(prototipo.desarrollo_id);
      }
      
      // Invalidar las consultas de prototipos para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['prototipos'] });
      queryClient.invalidateQueries({ queryKey: ['prototipo', prototipoId] });
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] });
    } catch (error) {
      console.error('Error updating prototipo units:', error);
    }
  };
  
  // Función para actualizar los contadores de un desarrollo basado en sus prototipos
  const updateDesarrolloUnidades = async (desarrolloId: string) => {
    try {
      // Obtener conteo real de unidades por estado directamente de la tabla unidades
      const counts = await countDesarrolloUnidadesByStatus(desarrolloId);
      
      console.log('Real counts from units table for desarrollo:', desarrolloId, counts);
      
      // Actualizar el desarrollo con los valores reales
      await supabase
        .from('desarrollos')
        .update({
          total_unidades: counts.total,
          unidades_disponibles: counts.disponibles
        })
        .eq('id', desarrolloId);
      
      // Invalidar las consultas de desarrollos para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] });
      queryClient.invalidateQueries({ queryKey: ['desarrollo', desarrolloId] });
    } catch (error) {
      console.error('Error updating desarrollo units:', error);
    }
  };

  return {
    unidades: unidadesQuery.data || [],
    isLoading: unidadesQuery.isLoading,
    error: unidadesQuery.error,
    refetch: unidadesQuery.refetch,
    createUnidad,
    updateUnidad,
    deleteUnidad,
    createMultipleUnidades,
    countUnidadesByStatus,
    countDesarrolloUnidadesByStatus,
    updatePrototipoUnidades,
    updateDesarrolloUnidades
  };
};

export default useUnidades;
