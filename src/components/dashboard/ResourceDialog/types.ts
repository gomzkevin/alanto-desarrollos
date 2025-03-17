
import { Json } from '@/integrations/supabase/types';

export type ResourceType = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones' | 'unidades';

export interface FormValues {
  [key: string]: any;
}

export interface DesarrolloResource extends FormValues {
  id?: string;
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  amenidades?: string[] | string;
  descripcion?: string;
  fecha_inicio?: string | Date;
  fecha_entrega?: string | Date;
  imagen_url?: string;
  avance_porcentaje?: number;
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
}

export interface PrototipoResource extends FormValues {
  id?: string;
  desarrollo_id: string;
  nombre: string;
  tipo: string;
  precio: number;
  total_unidades: number;
  unidades_disponibles: number;
  unidades_vendidas?: number;
  unidades_con_anticipo?: number;
  superficie?: number;
  habitaciones?: number;
  baños?: number;
  estacionamientos?: number;
  descripcion?: string;
  imagen_url?: string;
}

export interface LeadResource extends FormValues {
  id?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  interes_en?: string;
  origen?: string;
  estado: string;
  subestado?: string;
  agente?: string;
  fecha_creacion?: string | Date;
  ultimo_contacto?: string | Date;
  notas?: string;
}

export interface CotizacionResource extends FormValues {
  id?: string;
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  monto_finiquito?: number;
  usar_finiquito?: boolean;
  fecha_inicio_pagos?: string | Date;
  fecha_finiquito?: string | Date;
  notas?: string;
}

export interface UnidadResource extends FormValues {
  id?: string;
  prototipo_id: string;
  numero: string;
  nivel?: string;
  estado: string;
  precio_venta?: number;
  fecha_venta?: string | Date;
  comprador_id?: string;
  comprador_nombre?: string;
  created_at?: string | Date;
}

export interface AdminResourceDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSave?: (resource: FormValues) => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  defaultValues?: FormValues;
}

export interface FieldOption {
  value: string;
  label: string;
}

export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'switch' | 'image-upload' | 'date' | 'email' | 'select-lead' | 'lead-select' | 'amenities' | 'multiple-select';

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  tab?: string;
  bucket?: string;
  folder?: string;
  readOnly?: boolean;
}
