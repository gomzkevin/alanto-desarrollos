
import { Venta } from '../ventas/types';
import { Pago } from '../usePagos';

export interface Comprador {
  id: string;
  comprador_id: string;
  nombre: string;
  porcentaje: number;
  pagos_realizados?: number;
  total_pagos?: number;
}

// Extended Venta interface to ensure unidad has the id property
export interface VentaWithDetail extends Omit<Venta, 'unidad'> {
  unidad?: {
    id: string;
    numero: string;
    prototipo?: {
      nombre: string;
      desarrollo?: {
        nombre: string;
        empresa_id?: number;
      };
    };
  };
}

export interface UseVentaDetailReturn {
  venta: VentaWithDetail | null;
  compradores: Comprador[];
  pagos: Pago[];
  isLoading: boolean;
  montoPagado: number;
  progreso: number;
  refetch: () => Promise<void>;
  compradorVentaId: string;
  updateVentaStatus: (newStatus: string) => Promise<boolean>;
}
