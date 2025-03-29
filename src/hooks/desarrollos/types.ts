
import { Tables } from '@/integrations/supabase/types';

// Base desarrollo type from database
export type Desarrollo = Tables<"desarrollos">;

// Extended type with additional computed properties
export type DesarrolloExtended = Desarrollo & {
  imagen_principal?: string;
  total_prototipos?: number;
  total_unidades?: number;
  unidades_disponibles_total?: number;
  unidades_vendidas_total?: number;
};

// Options for fetching desarrollos
export type FetchDesarrollosOptions = {
  withStats?: boolean;
  withPrototipos?: boolean;
  empresaId?: number | null;
  staleTime?: number;
  limit?: number;
};
