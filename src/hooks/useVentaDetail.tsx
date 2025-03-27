
// Este archivo ahora importa desde la nueva organización modular
// para mantener compatibilidad con el código existente

import useVentaDetail from './ventaDetail';
export { useVentaDetail };
export type { Comprador, VentaWithDetail } from './ventaDetail/types';
export default useVentaDetail;
