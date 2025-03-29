
import { useVentasQuery } from './useVentasQuery';
import { useVentasMutations } from './useVentasMutations';
import { Venta, VentasFilter, FetchVentasOptions } from './types';

export { useVentasQuery, useVentasMutations };
export type { Venta, VentasFilter, FetchVentasOptions };

export const useVentas = (options: FetchVentasOptions = {}) => {
  const query = useVentasQuery(options);
  const mutations = useVentasMutations();
  
  return {
    ...query,
    ...mutations
  };
};

export default useVentas;
