
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VentaBasica, CompradoresVenta, Pago, PlanPago } from './useVentas';

export const useVentaDetail = (ventaId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener los detalles completos de una venta
  const fetchVentaDetail = async (): Promise<VentaBasica | null> => {
    if (!ventaId) return null;

    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            *,
            prototipo:prototipos(
              *,
              desarrollo:desarrollos(
                id, nombre
              )
            )
          ),
          compradores:compradores_venta(
            *,
            comprador:leads(*),
            vendedor:usuarios(id, nombre),
            pagos:pagos(*),
            plan_pago:plan_pagos(*)
          )
        `)
        .eq('id', ventaId)
        .single();

      if (error) {
        console.error('Error fetching venta details:', error);
        throw error;
      }

      // Procesar datos para añadir información calculada
      if (!data) return null;

      const compradores = data.compradores ? data.compradores.map((comprador: any) => {
        // Calcular el total pagado
        const totalPagado = comprador.pagos ? comprador.pagos.reduce(
          (sum: number, pago: any) => 
            pago.estado === 'verificado' ? sum + pago.monto : sum, 
          0
        ) : 0;

        // Calcular el porcentaje pagado
        const porcentajePagado = comprador.monto_comprometido > 0 
          ? (totalPagado / comprador.monto_comprometido) * 100 
          : 0;

        return {
          ...comprador,
          total_pagado: totalPagado,
          porcentaje_pagado: Math.min(100, porcentajePagado)
        };
      }) : [];

      // Calcular el progreso total de la venta
      const totalComprometido = compradores.reduce(
        (sum: number, c: any) => sum + c.monto_comprometido, 
        0
      );
      
      const totalPagado = compradores.reduce(
        (sum: number, c: any) => sum + (c.total_pagado || 0), 
        0
      );
      
      const progresoVenta = totalComprometido > 0 
        ? (totalPagado / totalComprometido) * 100 
        : 0;

      return {
        ...data,
        compradores,
        progreso: Math.min(100, progresoVenta)
      };
    } catch (error) {
      console.error('Error in fetchVentaDetail:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los detalles de la venta',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Actualizar datos de una venta
  const updateVenta = async (ventaData: Partial<VentaBasica>): Promise<VentaBasica | null> => {
    if (!ventaId) return null;

    try {
      const { data, error } = await supabase
        .from('ventas')
        .update(ventaData)
        .eq('id', ventaId)
        .select()
        .single();

      if (error) {
        console.error('Error updating venta:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateVenta:', error);
      throw error;
    }
  };

  // Actualizar un comprador de venta
  const updateCompradorVenta = async (
    compradorId: string, 
    compradorData: Partial<CompradoresVenta>
  ): Promise<CompradoresVenta | null> => {
    try {
      const { data, error } = await supabase
        .from('compradores_venta')
        .update(compradorData)
        .eq('id', compradorId)
        .select()
        .single();

      if (error) {
        console.error('Error updating comprador_venta:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateCompradorVenta:', error);
      throw error;
    }
  };

  // Crear un comprador adicional para una venta fraccional
  const createCompradorVenta = async (
    compradorData: Omit<CompradoresVenta, 'id' | 'created_at' | 'comprador' | 'vendedor' | 'pagos' | 'plan_pago' | 'total_pagado' | 'porcentaje_pagado'>
  ): Promise<CompradoresVenta | null> => {
    try {
      const { data, error } = await supabase
        .from('compradores_venta')
        .insert({
          ...compradorData,
          venta_id: ventaId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating comprador_venta:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createCompradorVenta:', error);
      throw error;
    }
  };

  // Eliminar un comprador de venta (solo disponible para ventas fraccionales)
  const deleteCompradorVenta = async (compradorId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('compradores_venta')
        .delete()
        .eq('id', compradorId);

      if (error) {
        console.error('Error deleting comprador_venta:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteCompradorVenta:', error);
      throw error;
    }
  };

  // Crear o actualizar el plan de pagos para un comprador
  const upsertPlanPago = async (
    compradorId: string, 
    planData: Omit<PlanPago, 'id' | 'created_at'>
  ): Promise<PlanPago | null> => {
    try {
      // Verificar si ya existe un plan de pagos
      const { data: existingPlan } = await supabase
        .from('plan_pagos')
        .select('id')
        .eq('comprador_venta_id', compradorId)
        .maybeSingle();

      let result;
      
      if (existingPlan) {
        // Actualizar plan existente
        result = await supabase
          .from('plan_pagos')
          .update({
            ...planData,
            comprador_venta_id: compradorId
          })
          .eq('id', existingPlan.id)
          .select()
          .single();
      } else {
        // Crear nuevo plan
        result = await supabase
          .from('plan_pagos')
          .insert({
            ...planData,
            comprador_venta_id: compradorId
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error in upsert plan_pagos:', result.error);
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Error in upsertPlanPago:', error);
      throw error;
    }
  };

  // Registrar un nuevo pago
  const createPago = async (
    compradorId: string,
    pagoData: Omit<Pago, 'id' | 'created_at' | 'comprador_venta_id'>
  ): Promise<Pago | null> => {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .insert({
          ...pagoData,
          comprador_venta_id: compradorId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating pago:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createPago:', error);
      throw error;
    }
  };

  // Actualizar el estado de un pago
  const updatePagoEstado = async (
    pagoId: string, 
    estado: string
  ): Promise<Pago | null> => {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .update({ estado })
        .eq('id', pagoId)
        .select()
        .single();

      if (error) {
        console.error('Error updating pago estado:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePagoEstado:', error);
      throw error;
    }
  };

  // Consulta React Query para obtener los detalles de la venta
  const { 
    data: ventaDetail, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['venta-detail', ventaId],
    queryFn: fetchVentaDetail,
    enabled: !!ventaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutación para actualizar venta
  const updateVentaMutation = useMutation({
    mutationFn: (data: Partial<VentaBasica>) => updateVenta(data),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Venta actualizada correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['venta-detail', ventaId] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo actualizar la venta: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para actualizar comprador venta
  const updateCompradorVentaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompradoresVenta> }) => 
      updateCompradorVenta(id, data),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Información del comprador actualizada correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['venta-detail', ventaId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo actualizar la información del comprador: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para crear comprador venta
  const createCompradorVentaMutation = useMutation({
    mutationFn: (data: Omit<CompradoresVenta, 'id' | 'created_at' | 'comprador' | 'vendedor' | 'pagos' | 'plan_pago' | 'total_pagado' | 'porcentaje_pagado'>) => 
      createCompradorVenta(data),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Comprador añadido correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['venta-detail', ventaId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo añadir el comprador: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para eliminar comprador venta
  const deleteCompradorVentaMutation = useMutation({
    mutationFn: (compradorId: string) => deleteCompradorVenta(compradorId),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Comprador eliminado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['venta-detail', ventaId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo eliminar el comprador: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para crear/actualizar plan de pagos
  const upsertPlanPagoMutation = useMutation({
    mutationFn: ({ compradorId, planData }: { 
      compradorId: string; 
      planData: Omit<PlanPago, 'id' | 'created_at'> 
    }) => upsertPlanPago(compradorId, planData),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Plan de pagos guardado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['venta-detail', ventaId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo guardar el plan de pagos: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para crear pago
  const createPagoMutation = useMutation({
    mutationFn: ({ compradorId, pagoData }: { 
      compradorId: string; 
      pagoData: Omit<Pago, 'id' | 'created_at' | 'comprador_venta_id'> 
    }) => createPago(compradorId, pagoData),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Pago registrado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['venta-detail', ventaId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo registrar el pago: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutación para actualizar estado de pago
  const updatePagoEstadoMutation = useMutation({
    mutationFn: ({ pagoId, estado }: { pagoId: string; estado: string }) => 
      updatePagoEstado(pagoId, estado),
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Estado del pago actualizado correctamente',
      });
      queryClient.invalidateQueries({ queryKey: ['venta-detail', ventaId] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `No se pudo actualizar el estado del pago: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    ventaDetail,
    isLoading,
    error,
    refetch,
    updateVenta: updateVentaMutation.mutate,
    updateCompradorVenta: updateCompradorVentaMutation.mutate,
    createCompradorVenta: createCompradorVentaMutation.mutate,
    deleteCompradorVenta: deleteCompradorVentaMutation.mutate,
    upsertPlanPago: upsertPlanPagoMutation.mutate,
    createPago: createPagoMutation.mutate,
    updatePagoEstado: updatePagoEstadoMutation.mutate,
    isUpdating: 
      updateVentaMutation.isPending || 
      updateCompradorVentaMutation.isPending || 
      createCompradorVentaMutation.isPending || 
      deleteCompradorVentaMutation.isPending ||
      upsertPlanPagoMutation.isPending ||
      createPagoMutation.isPending ||
      updatePagoEstadoMutation.isPending
  };
};

export default useVentaDetail;
