
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venta } from './useVentas';
import { Pago } from './usePagos';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Comprador {
  id: string;
  comprador_id: string;
  nombre: string;
  porcentaje: number;
  pagos_realizados?: number;
  total_pagos?: number;
}

export const useVentaDetail = (ventaId?: string) => {
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch venta details
  const fetchVentaDetail = async (): Promise<Venta | null> => {
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
              desarrollo:desarrollos(*)
            )
          )
        `)
        .eq('id', ventaId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener detalles de venta:', error);
      return null;
    }
  };

  const { data: venta, isLoading: isVentaLoading, refetch: refetchVenta } = useQuery({
    queryKey: ['venta', ventaId],
    queryFn: fetchVentaDetail,
    enabled: !!ventaId,
  });

  // Fetch compradores with lead information
  const fetchCompradores = async (): Promise<Comprador[]> => {
    if (!ventaId) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('compradores_venta')
        .select(`
          *,
          comprador:leads(id, nombre)
        `)
        .eq('venta_id', ventaId);

      if (error) throw error;

      // Count pagos for each comprador
      const compradoresWithPagos = await Promise.all(
        data.map(async (item) => {
          const { count, error: pagosError } = await supabase
            .from('pagos')
            .select('id', { count: 'exact', head: true })
            .eq('comprador_venta_id', item.id)
            .eq('estado', 'registrado');
            
          return {
            id: item.id,
            comprador_id: item.comprador_id,
            nombre: item.comprador?.nombre || 'Comprador sin nombre',
            porcentaje: item.porcentaje_propiedad,
            pagos_realizados: count || 0,
          };
        })
      );

      return compradoresWithPagos;
    } catch (error) {
      console.error('Error al obtener compradores:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const { data: compradoresData = [], isLoading: isCompradoresLoading, refetch: refetchCompradores } = useQuery({
    queryKey: ['compradores', ventaId],
    queryFn: fetchCompradores,
    enabled: !!ventaId,
  });

  // Set compradores to state
  useEffect(() => {
    if (compradoresData) {
      setCompradores(compradoresData);
    }
  }, [compradoresData]);

  // Fetch all pagos for this venta (regardless of comprador)
  const fetchPagos = async (): Promise<Pago[]> => {
    if (!ventaId || !compradoresData.length) return [];
    
    try {
      // Get all comprador_venta_ids for this venta
      const compradorVentaIds = compradoresData.map(c => c.id);
      
      if (!compradorVentaIds.length) return [];
      
      const { data, error } = await supabase
        .from('pagos')
        .select('*')
        .in('comprador_venta_id', compradorVentaIds)
        .order('fecha', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure estados conform to the expected type
      const typedPagos: Pago[] = (data || []).map(pago => ({
        ...pago,
        estado: pago.estado === 'rechazado' ? 'rechazado' : 'registrado'
      }));
      
      return typedPagos;
    } catch (error) {
      console.error('Error al obtener pagos de la venta:', error);
      return [];
    }
  };

  const { data: pagosData = [], isLoading: isPagosLoading, refetch: refetchPagos } = useQuery({
    queryKey: ['pagos-venta', ventaId, compradoresData],
    queryFn: fetchPagos,
    enabled: !!ventaId && compradoresData.length > 0,
  });

  // Update pagos in state when data changes
  useEffect(() => {
    setPagos(pagosData);
  }, [pagosData]);

  // Calculate payment progress
  const montoPagado = pagos.reduce((total, pago) => {
    return pago.estado === 'registrado' ? total + pago.monto : total;
  }, 0);

  const progreso = venta?.precio_total
    ? Math.round((montoPagado / venta.precio_total) * 100)
    : 0;

  // Update venta status if needed
  useEffect(() => {
    const updateVentaStatus = async () => {
      if (!venta || !ventaId) return;
      
      // Check if we've reached 100% payment but status is still "en_proceso"
      if (progreso >= 100 && venta.estado === 'en_proceso') {
        try {
          // Update venta status to "completada"
          const { error } = await supabase
            .from('ventas')
            .update({ 
              estado: 'completada',
              fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', ventaId);
            
          if (error) {
            console.error('Error al actualizar estado de venta:', error);
            return;
          }
          
          // Also update the unidad status to "vendido"
          if (venta.unidad?.id) {
            const { error: unidadError } = await supabase
              .from('unidades')
              .update({ estado: 'vendido' })
              .eq('id', venta.unidad.id);
              
            if (unidadError) {
              console.error('Error al actualizar estado de unidad:', unidadError);
            }
          }
          
          // Refresh data
          refetchVenta();
          
          toast({
            title: "¡Venta completada!",
            description: "La venta ha sido marcada como completada porque se ha alcanzado el 100% del pago.",
          });
        } catch (err) {
          console.error('Error en actualización automática de estado:', err);
        }
      }
    };
    
    updateVentaStatus();
  }, [progreso, venta, ventaId, toast, refetchVenta]);

  // Manual function to update venta status
  const updateVentaStatus = async (newStatus: string) => {
    if (!ventaId) return false;
    
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ 
          estado: newStatus,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', ventaId);
        
      if (error) throw error;
      
      // If marking as completada, also update unidad status
      if (newStatus === 'completada' && venta?.unidad?.id) {
        const { error: unidadError } = await supabase
          .from('unidades')
          .update({ estado: 'vendido' })
          .eq('id', venta.unidad.id);
          
        if (unidadError) {
          console.error('Error al actualizar estado de unidad:', unidadError);
        }
      }
      
      toast({
        title: "Estado actualizado",
        description: `La venta ha sido marcada como "${newStatus}".`,
      });
      
      await refetchVenta();
      return true;
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la venta.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Refetch all data
  const refetch = async () => {
    await refetchVenta();
    await refetchCompradores();
    await refetchPagos();
  };

  const compradorVentaId = compradores.length > 0 ? compradores[0].id : '';

  return {
    venta,
    compradores,
    pagos,
    isLoading: isVentaLoading || isCompradoresLoading || isPagosLoading || loading,
    montoPagado,
    progreso,
    refetch,
    compradorVentaId,
    updateVentaStatus
  };
};

export default useVentaDetail;
