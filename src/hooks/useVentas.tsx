
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venta, VentasFilters } from './types';

export const useVentas = (filters: VentasFilters = {}) => {
  const {
    estado,
    fechaInicio,
    fechaFin,
    unidadId,
    desarrolloId,
    compradorId,
    empresa_id,
  } = filters;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ventas', filters],
    queryFn: async () => {
      let query = supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(*)
        `);

      // Apply filters
      if (estado && estado !== 'todos') {
        query = query.eq('estado', estado);
      }

      if (fechaInicio) {
        query = query.gte('fecha_inicio', fechaInicio);
      }

      if (fechaFin) {
        query = query.lte('fecha_inicio', fechaFin);
      }

      if (unidadId) {
        query = query.eq('unidad_id', unidadId);
      }

      if (desarrolloId) {
        query = query.eq('desarrollos.id', desarrolloId);
      }

      if (compradorId) {
        // This is a bit more complex, would need a join or a separate query
        // For now, we'll simplify and handle this on the frontend
      }

      if (empresa_id) {
        query = query.eq('empresa_id', empresa_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ventas:', error);
        return [];
      }

      // Cast the data to ensure it matches the expected type
      return data as unknown as Venta[];
    },
  });

  return {
    ventas: data || [],
    isLoading,
    error,
    refetch
  };
};

export const useCreateVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ventaData: Partial<Venta>) => {
      const { data, error } = await supabase
        .from('ventas')
        .insert([ventaData as any])
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
};

export const useUpdateVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<Venta>) => {
      const { data, error } = await supabase
        .from('ventas')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
};

export const useDeleteVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ventas')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
};

export default useVentas;
