
import { Tables } from '@/integrations/supabase/types';

export interface UnidadCount {
  disponibles: number;
  vendidas: number;
  con_anticipo: number;
  total: number;
}

export type Unidad = Tables<"unidades"> & {
  prototipo?: Tables<"prototipos">;
};

export interface UseUnidadesParams {
  prototipo_id?: string;
}

export interface CreateMultipleUnidadesParams {
  prototipo_id: string;
  cantidad: number;
  prefijo?: string;
}
