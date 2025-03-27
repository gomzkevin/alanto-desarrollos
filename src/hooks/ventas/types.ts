
import { Database } from '@/integrations/supabase/types';

// Tipos básicos
export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  unidad?: {
    id: string;
    numero: string;
    prototipo_id?: string;
    prototipo?: {
      nombre: string;
      desarrollo_id?: string;
      desarrollo?: {
        nombre: string;
        empresa_id?: number;
      };
    };
  };
  progreso?: number;
}

export interface VentasFilter {
  desarrollo_id?: string;
  estado?: string;
  busqueda?: string;
}

export interface VentaCreate {
  unidad_id: string;
  precio_total: number;
  es_fraccional: boolean;
  estado?: string;
}

export interface VentaUpdate extends Partial<Omit<Venta, 'id'>> {
  fecha_actualizacion?: string;
}
