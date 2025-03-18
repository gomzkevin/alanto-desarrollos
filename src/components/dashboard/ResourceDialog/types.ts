
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'number' 
  | 'select'
  | 'date'
  | 'switch'
  | 'amenities'
  | 'image-upload'
  | 'upload'
  | 'interest-selector'
  | 'select-lead';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  tab?: string;
  required?: boolean;
  bucket?: string;
  folder?: string;
  readOnly?: boolean;
  description?: string;
  placeholder?: string;
}

export type ResourceType = 
  | 'desarrollos' 
  | 'prototipos' 
  | 'leads' 
  | 'cotizaciones'
  | 'unidades';

export interface FormValues {
  [key: string]: any;
  id?: string;
}

export interface PrototipoResource extends FormValues {
  nombre: string;
  desarrollo_id: string;
  tipo: string;
  precio: number;
  superficie?: number;
  habitaciones?: number;
  baños?: number;
  estacionamientos?: number;
  total_unidades: number;
  unidades_disponibles: number;
  unidades_vendidas: number;
  unidades_con_anticipo: number;
  descripcion?: string;
  imagen_url?: string;
}

export interface DesarrolloResource extends FormValues {
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
  amenidades?: string[] | null;
}

export interface LeadResource extends FormValues {
  nombre: string;
  email?: string;
  telefono?: string;
  interes_en?: string;
  origen?: string;
  estado?: string;
  subestado?: string;
  agente?: string;
  notas?: string;
  ultimo_contacto?: string;
}

export interface CotizacionResource extends FormValues {
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito?: boolean;
  monto_finiquito?: number;
  notas?: string;
}

export interface UnidadResource extends FormValues {
  prototipo_id: string;
  numero: string;
  estado: 'disponible' | 'apartado' | 'en_proceso' | 'vendido';
  nivel?: string;
  precio_venta?: number;
  comprador_id?: string;
  comprador_nombre?: string;
  fecha_venta?: string;
  vendedor_id?: string;
  vendedor_nombre?: string;
}

export interface ResourceDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: string;
}

export interface AdminResourceDialogProps extends ResourceDialogProps {
  onSave?: () => void;
  defaultValues?: Record<string, any>;
}
