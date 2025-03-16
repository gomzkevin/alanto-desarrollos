
export type ResourceType = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones' | 'unidades';

export type FormValues = Record<string, any>;

export interface DesarrolloResource {
  id?: string;
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  avance_porcentaje: number;
  descripcion?: string;
  imagen_url?: string;
  moneda: string;
  comision_operador: number;
  mantenimiento_valor: number;
  es_mantenimiento_porcentaje: boolean;
  gastos_fijos: number;
  es_gastos_fijos_porcentaje: boolean;
  gastos_variables: number;
  es_gastos_variables_porcentaje: boolean;
  impuestos: number;
  es_impuestos_porcentaje: boolean;
  adr_base: number;
  ocupacion_anual: number;
  amenidades?: string[] | null;
}

export interface PrototipoResource {
  id?: string;
  nombre: string;
  desarrollo_id: string;
  tipo: string;
  precio: number;
  superficie: number;
  habitaciones: number;
  baños: number;
  estacionamientos: number;
  total_unidades: number;
  unidades_disponibles: number;
}

export interface LeadResource {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  interes_en?: string;
  origen: string;
  estado: string;
  subestado: string;
}

export interface CotizacionResource {
  id?: string;
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  unidad_id?: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito: boolean;
}

export interface UnidadResource {
  id?: string;
  prototipo_id: string;
  numero: string;
  estado: string;
  comprador_id?: string;
  comprador_nombre?: string;
}

export interface AdminResourceDialogProps {
  resourceType: ResourceType;
  resourceId?: string;
  open?: boolean;
  onClose?: () => void;
  onSave?: () => void;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
  unidad_id?: string;
  defaultValues?: Record<string, any>;
}

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'date' | 'image' | 'select-lead' | 'select-desarrollo' | 'select-prototipo' | 'email' | 'upload' | 'amenities';
  options?: FieldOption[];
  tab?: string;
}
