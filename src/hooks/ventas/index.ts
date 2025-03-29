
import { useVentasQuery } from './useVentasQuery';
import { useVentasMutations } from './useVentasMutations';
export type { FetchVentasOptions } from './useVentasQuery';

// Re-export the useVentasQuery hook and other hooks related to ventas
export { useVentasQuery, useVentasMutations };

// Export a wrapper hook that combines the functionality of both hooks
export const useVentas = (options: FetchVentasOptions = {}) => {
  const query = useVentasQuery(options);
  const mutations = useVentasMutations();
  
  return {
    ...query,
    ...mutations
  };
};
