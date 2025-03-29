
import { useVentaQuery } from './useVentaQuery';
import { usePagosQuery } from './usePagosQuery';
import { useCompradoresQuery } from './useCompradoresQuery';
import { useVentaDetailMutations } from './useVentaDetailMutations';
import { Comprador, VentaWithDetail } from './types';

export type { Comprador, VentaWithDetail };

export const useVentaDetail = (ventaId?: string) => {
  const { data: venta, ...ventaQuery } = useVentaQuery(ventaId);
  const { data: compradores = [], ...compradoresQuery } = useCompradoresQuery(ventaId);
  const { data: pagos = [], ...pagosQuery } = usePagosQuery(ventaId);
  const { updateVentaStatus } = useVentaDetailMutations();

  const compradorVentaId = compradores && compradores.length > 0 ? compradores[0].id : null;

  const montoPagado = pagos?.reduce((acc, pago) => acc + pago.monto, 0) || 0;

  const progreso = venta ? (montoPagado / venta.precio_total) * 100 : 0;

  // Format compradores to match the InfoTab expected format
  const formattedCompradores = compradores.map(c => ({
    id: c.id,
    comprador_id: c.id,
    nombre: c.nombre,
    porcentaje: c.porcentaje_propiedad,
    pagos_realizados: pagos?.filter(p => p.comprador_venta_id === c.id).length || 0
  }));

  const refetch = () => {
    ventaQuery.refetch();
    pagosQuery.refetch();
    compradoresQuery.refetch();
  };

  return {
    venta,
    compradores,
    formattedCompradores,
    pagos,
    isLoading: ventaQuery.isLoading || pagosQuery.isLoading || compradoresQuery.isLoading,
    montoPagado,
    progreso,
    refetch,
    compradorVentaId,
    updateVentaStatus
  };
};

export default useVentaDetail;
