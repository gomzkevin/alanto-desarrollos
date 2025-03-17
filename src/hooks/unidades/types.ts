
import { Tables } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

export interface UnidadCount {
  disponibles: number;
  vendidas: number;
  con_anticipo: number;
  total: number;
}

export type Unidad = Tables<"unidades"> & {
  prototipo?: {
    id: string;
    nombre: string;
    precio: number;
    baños?: number | null;
    caracteristicas?: Json | null;
    desarrollo_id?: string;
    descripcion?: string | null;
    estacionamientos?: number | null;
    habitaciones?: number | null;
    imagen_url?: string | null;
    superficie?: number | null;
    tipo?: string;
    total_unidades?: number;
    unidades_disponibles?: number;
    unidades_con_anticipo?: number | null;
    unidades_vendidas?: number | null;
  };
};

export interface UseUnidadesParams {
  prototipo_id?: string;
}

export interface CreateMultipleUnidadesParams {
  prototipo_id: string;
  cantidad: number;
  prefijo?: string;
}
