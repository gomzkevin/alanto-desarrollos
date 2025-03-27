
import { useMemo } from 'react';
import { Pago } from '../usePagos';
import { VentaWithDetail } from './types';

/**
 * Hook para calcular el progreso de pago de una venta
 */
export const useProgresoCalculation = (venta: VentaWithDetail | null, pagos: Pago[]) => {
  return useMemo(() => {
    // Calculate payment progress
    const montoPagado = pagos.reduce((total, pago) => {
      return pago.estado === 'registrado' ? total + pago.monto : total;
    }, 0);

    const progreso = venta?.precio_total
      ? Math.round((montoPagado / venta.precio_total) * 100)
      : 0;

    return {
      montoPagado,
      progreso
    };
  }, [venta, pagos]);
};

export default useProgresoCalculation;
