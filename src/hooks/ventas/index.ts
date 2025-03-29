
import { useVentasQuery } from './useVentasQuery';
import { useVentasMutations } from './useVentasMutations';
import { VentasFilter, Venta, VentaCreate, VentaUpdate } from './types';

/**
 * Hook principal que combina consultas y mutaciones de ventas
 */
export const useVentas = (filters: VentasFilter = {}) => {
  const { data = [], isLoading, error, refetch } = useVentasQuery(filters);
  const { createVenta, updateVenta, isCreating, isUpdating } = useVentasMutations();

  return {
    ventas: data,
    isLoading,
    error,
    refetch,
    createVenta,
    updateVenta,
    isCreating,
    isUpdating
  };
};

export type { VentasFilter, Venta, VentaCreate, VentaUpdate };
export default useVentas;
