import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Unidad = Tables<"unidades"> & {
  vendedor_nombre?: string;
};

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

  const fetchUnidades = async (options: FetchUnidadesOptions = {}): Promise<Unidad[]> => {
    try {
      console.log('Fetching unidades with options:', options);
      
      let query = supabase
        .from('unidades')
        .select('*, usuarios(nombre)');
      
      if (options.prototipo_id) {
        query = query.eq('prototipo_id', options.prototipo_id);
      }
      
      if (options.estado) {
        query = query.eq('estado', options.estado);
      }
      
      const { data, error } = await query.order('numero', { ascending: true });
      
      if (error) {
        console.error('Error fetchUnidades:', error);
        throw new Error(error.message);
      }
      
      const unidades = data.map(unidad => {
        const vendedor = unidad.usuarios as { nombre: string } | null;
        return {
          ...unidad,
          vendedor_nombre: vendedor?.nombre || null,
          usuarios: undefined
        };
      });
      
      console.log('Unidades fetched:', unidades);
      return unidades;
    } catch (error) {
      console.error('Error en fetchUnidades:', error);
      throw error;
    }
  };

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

  const countDesarrolloUnidadesByStatus = async (desarrolloId: string): Promise<UnidadesCountByStatus> => {
    try {
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
      
      const prototipoIds = prototipos.map(p => p.id);
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('estado')
        .in('prototipo_id', prototipoIds);
      
      if (unidadesError) throw unidadesError;
      
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

  const unidadesQuery = useQuery({
    queryKey: ['unidades', prototipo_id, estado],
    queryFn: fetchUnidades
  });

  const createUnidad = useMutation({
    mutationFn: async (unidad: Omit<Unidad, 'id' | 'created_at'>) => {
      const { vendedor_nombre, ...unidadData } = unidad;
      
      const { data, error } = await supabase
        .from('unidades')
        .insert(unidadData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      
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

  const updateUnidad = useMutation({
    mutationFn: async ({ id, ...unidad }: Partial<Unidad> & { id: string }) => {
      const { vendedor_nombre, ...unidadData } = unidad;
      
      const { data: oldUnidad } = await supabase
        .from('unidades')
        .select('prototipo_id')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('unidades')
        .update(unidadData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, oldPrototipoId: oldUnidad?.prototipo_id };
    },
    onSuccess: async ({ data, oldPrototipoId }) => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      
      if (oldPrototipoId && data.prototipo_id !== oldPrototipoId) {
        await updatePrototipoUnidades(oldPrototipoId);
      }
      
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

  const updatePrototipoUnidades = async (prototipoId: string) => {
    try {
      const counts = await countUnidadesByStatus(prototipoId);
      
      await supabase
        .from('prototipos')
        .update({
          unidades_disponibles: counts.disponibles,
          unidades_vendidas: counts.vendidas,
          unidades_con_anticipo: counts.con_anticipo,
          total_unidades: counts.total
        })
        .eq('id', prototipoId);
      
      const { data: prototipo } = await supabase
        .from('prototipos')
        .select('desarrollo_id')
        .eq('id', prototipoId)
        .single();
      
      if (prototipo && prototipo.desarrollo_id) {
        await updateDesarrolloUnidades(prototipo.desarrollo_id);
      }
      
      query

