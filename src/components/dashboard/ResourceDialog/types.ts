
import { Json } from '@/integrations/supabase/types';

export type ResourceType = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones' | 'unidades';

export interface AdminResourceDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSave?: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
  defaultValues?: Record<string, any>;
}

export interface DesarrolloResource {
  id?: string;
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  avance_porcentaje?: number;
  fecha_inicio?: string;
  fecha_entrega?: string;
  descripcion?: string;
  imagen_url?: string;
  moneda?: string;
  comision_operador?: number;
  mantenimiento_valor?: number;
  es_mantenimiento_porcentaje?: boolean;
  gastos_fijos?: number;
  es_gastos_fijos_porcentaje?: boolean;
  gastos_variables?: number;
  es_gastos_variables_porcentaje?: boolean;
  impuestos?: number;
  es_impuestos_porcentaje?: boolean;
  adr_base?: number;
  ocupacion_anual?: number;
  amenidades?: string[] | Json;
}

export interface PrototipoResource {
  id?: string;
  nombre: string;
  tipo: string;
  precio: number;
  superficie?: number;
  habitaciones?: number;
  baños?: number;
  estacionamientos?: number;
  total_unidades: number;
  unidades_disponibles: number;
  unidades_vendidas?: number;
  unidades_con_anticipo?: number;
  desarrollo_id: string;
  descripcion?: string;
  imagen_url?: string;
  caracteristicas?: Json;
}

export interface UnidadResource {
  id?: string;
  prototipo_id: string;
  nivel?: string;
  numero: string;
  estado: string;
  comprador_id?: string;
  comprador_nombre?: string;
  precio_venta?: number;
  fecha_venta?: string;
}

export interface LeadResource {
  id?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  interes_en?: string;
  origen?: string;
  estado?: string;
  subestado?: string;
  agente?: string;
  notas?: string;
  fecha_creacion?: string;
  ultimo_contacto?: string;
}

export interface CotizacionResource {
  id?: string;
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito?: boolean;
  monto_finiquito?: number;
  notas?: string;
  created_at?: string;
}

export type FormValues = DesarrolloResource | PrototipoResource | LeadResource | CotizacionResource | UnidadResource;

export interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  tab?: string;
  options?: { value: string; label: string }[];
}
