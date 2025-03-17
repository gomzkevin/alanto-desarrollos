export type ResourceType = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones' | 'unidades';

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'date' 
  | 'switch' 
  | 'amenities'
  | 'email'
  | 'image-upload'
  | 'upload'
  | 'select-lead'
  | 'lead-select';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  tab?: string;
  options?: FieldOption[];
  readOnly?: boolean;
  bucket?: string;
  folder?: string;
}

export interface FormValues {
  [key: string]: any;
  id?: string;
}

export interface DesarrolloResource extends FormValues {
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  descripcion?: string;
  avance_porcentaje?: number;
  fecha_inicio?: string | Date;
  fecha_entrega?: string | Date;
  amenidades?: string[] | string;
  imagen_url?: string;
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
  moneda?: string;
}

export interface PrototipoResource extends FormValues {
  nombre: string;
  tipo: string;
  precio: number;
  superficie?: number;
  habitaciones?: number;
  baños?: number;
  estacionamientos?: number;
  descripcion?: string;
  total_unidades: number;
  unidades_disponibles: number;
  unidades_vendidas: number;
  unidades_con_anticipo: number;
  desarrollo_id: string;
  imagen_url?: string;
}

export interface LeadResource extends FormValues {
  nombre: string;
  email?: string;
  telefono?: string;
  agente?: string;
  estado: string;
  subestado?: string;
  origen?: string;
  interes_en?: string;
  ultimo_contacto?: string | Date;
  notas?: string;
}

export interface CotizacionResource extends FormValues {
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito?: boolean;
  monto_finiquito?: number;
  fecha_inicio_pagos?: string | Date;
  fecha_finiquito?: string | Date;
  notas?: string;
}

export interface UnidadResource {
  id?: string;
  prototipo_id: string;
  numero: string;
  nivel?: string;
  estado: string;
  precio_venta?: number;
  fecha_venta?: string | Date;
  comprador_id?: string;
  comprador_nombre?: string;
}

export interface AdminResourceDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSave?: (resource: FormValues) => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
  defaultValues?: FormValues;
}
