
// Este archivo ahora importa desde la nueva organización modular
// para mantener compatibilidad con el código existente

import { useVentas } from './ventas';
export { useVentas };
export type { Venta, VentasFilter } from './ventas/types';
export default useVentas;
