
import { useState, useEffect } from 'react';
import { useVentaQuery } from './useVentaQuery';
import { useCompradoresQuery } from './useCompradoresQuery';
import { usePagosQuery } from './usePagosQuery';
import { useVentaStatus } from './useVentaStatus';
import { useProgresoCalculation } from './useProgresoCalculation';
import { useAutoUpdateVentaStatus } from './useAutoUpdateVentaStatus';
import { Comprador, VentaWithDetail, UseVentaDetailReturn } from './types';
import { Pago } from '../usePagos';

/**
 * Hook principal para gestionar los detalles de una venta,
 * incluyendo compradores, pagos y cálculos derivados.
 */
export const useVentaDetail = (ventaId?: string): UseVentaDetailReturn => {
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Consultas principales
  const { 
    data: venta, 
    isLoading: isVentaLoading, 
    refetch: refetchVenta 
  } = useVentaQuery(ventaId);
  
  const { 
    data: compradoresData = [], 
    isLoading: isCompradoresLoading, 
    refetch: refetchCompradores 
  } = useCompradoresQuery(ventaId);
  
  const { 
    data: pagosData = [], 
    isLoading: isPagosLoading, 
    refetch: refetchPagos 
  } = usePagosQuery(ventaId, compradoresData);

  // Set compradores to state
  useEffect(() => {
    if (compradoresData) {
      setCompradores(compradoresData);
    }
  }, [compradoresData]);

  // Update pagos in state when data changes
  useEffect(() => {
    setPagos(pagosData);
  }, [pagosData]);

  // Cálculos de progreso
  const { montoPagado, progreso } = useProgresoCalculation(venta, pagos);

  // Actualización automática del estado de venta
  useAutoUpdateVentaStatus(ventaId, venta, progreso, refetchVenta);

  // Función para actualizar el estado de una venta manualmente
  const { updateVentaStatus } = useVentaStatus(ventaId, venta, refetchVenta);

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

export type { Comprador, VentaWithDetail };
export default useVentaDetail;
