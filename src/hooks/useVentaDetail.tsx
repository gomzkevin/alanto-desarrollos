
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venta } from './useVentas';
import { usePagos } from './usePagos';
import { useState, useEffect } from 'react';

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
  const [compradorVentaId, setCompradorVentaId] = useState<string>('');
  
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

  // Fetch compradores
  const fetchCompradores = async (): Promise<Comprador[]> => {
    if (!ventaId) return [];
    
    try {
      const { data, error } = await supabase
        .from('compradores_venta')
        .select(`
          *,
          comprador:leads(nombre)
        `)
        .eq('venta_id', ventaId);

      if (error) throw error;
      
      // Get first comprador_venta_id for payments
      if (data && data.length > 0) {
        setCompradorVentaId(data[0].id);
      }

      return data.map(item => ({
        id: item.id,
        comprador_id: item.comprador_id,
        nombre: item.comprador?.nombre || 'Comprador sin nombre',
        porcentaje: item.porcentaje_propiedad,
      }));
    } catch (error) {
      console.error('Error al obtener compradores:', error);
      return [];
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

  // Use pagos hook with the first comprador's id
  const { pagos, isLoading: isPagosLoading, refetch: refetchPagos } = usePagos(compradorVentaId);

  // Calculate payment progress
  const montoPagado = pagos.reduce((total, pago) => {
    return pago.estado === 'verificado' ? total + pago.monto : total;
  }, 0);

  const progreso = venta?.precio_total
    ? Math.round((montoPagado / venta.precio_total) * 100)
    : 0;

  // Refetch all data
  const refetch = async () => {
    await refetchVenta();
    await refetchCompradores();
    await refetchPagos();
  };

  return {
    venta,
    compradores,
    pagos,
    isLoading: isVentaLoading || isCompradoresLoading || isPagosLoading,
    montoPagado,
    progreso,
    refetch,
    compradorVentaId
  };
};

export default useVentaDetail;
