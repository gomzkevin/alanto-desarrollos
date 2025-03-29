
import { UseQueryResult } from '@tanstack/react-query';

export interface Venta {
  id: string;
  created_at: string;
  lead_id?: string; 
  unidad_id: string;
  estado: string;
  precio_total: number;
  fecha_inicio: string;
  es_fraccional: boolean;
  fecha_actualizacion: string;
  notas?: string;
  prototipo?: {
    id: string;
    nombre: string;
    precio: number;
    desarrollo?: {
      id: string;
      nombre: string;
      empresa_id: number;
    };
  };
  unidad: {
    id: string;
    numero: string;
    prototipo_id: string;
  };
}

export interface FetchVentasOptions {
  desarrolloId?: string;
  prototipoId?: string;
  unidadId?: string;
  estado?: string;
  limit?: number;
  enabled?: boolean;
}

export interface VentaCreate {
  unidad_id: string;
  precio_total: number;
  es_fraccional: boolean;
  estado?: string;
  notas?: string;
  fecha_inicio?: string;
  lead_id?: string;
}

export interface VentaUpdate {
  id: string;
  estado?: string;
  precio_total?: number;
  es_fraccional?: boolean;
  notas?: string;
  fecha_actualizacion?: string;
}

export interface VentasFilter {
  desarrolloId?: string;
  prototipoId?: string;
  estado?: string;
}

export type UseVentasReturn = UseQueryResult<Venta[], Error> & {
  ventas: Venta[];
};
