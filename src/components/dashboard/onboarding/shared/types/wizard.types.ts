export interface WizardStep {
  id: number;
  label: string;
  isComplete: boolean;
}

export interface DesarrolloWizardData {
  // Paso 2: Información Básica
  nombre?: string;
  ubicacion?: string;
  total_unidades?: number;
  descripcion?: string;
  
  // Paso 3: Características
  amenidades?: string[];
  
  // Paso 4: Fechas y Media
  fecha_inicio?: string;
  fecha_entrega?: string;
  imagen_url?: string;
}

export interface FinancialWizardData {
  // Paso 2: Configuración Base
  moneda?: string;
  adr_base?: number;
  ocupacion_anual?: number;
  comision_operador?: number;
  
  // Paso 3: Gastos e Impuestos
  mantenimiento_valor?: number;
  es_mantenimiento_porcentaje?: boolean;
  gastos_fijos?: number;
  es_gastos_fijos_porcentaje?: boolean;
  gastos_variables?: number;
  es_gastos_variables_porcentaje?: boolean;
  impuestos?: number;
  es_impuestos_porcentaje?: boolean;
}

export interface LeadWizardData {
  // Paso 2: Información del Prospecto
  nombre?: string;
  email?: string;
  telefono?: string;
  
  // Paso 3: Origen e Interés
  origen?: string;
  interes_en?: string;
  
  // Paso 4: Estado y Seguimiento
  estado?: string;
  subestado?: string;
  agente?: string;
  ultimo_contacto?: string;
  notas?: string;
  
  // Campos automáticos
  empresa_id?: number;
  fecha_creacion?: string;
}

export interface WizardState<T> {
  currentStep: number;
  completedSteps: Set<number>;
  data: T;
  errors: Record<string, string>;
}
