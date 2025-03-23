
// Common interface definitions to prevent circular dependencies and inconsistencies

// Basic interfaces for simple objects without deep references
export interface SimpleDesarrollo {
  id: string;
  nombre: string;
  ubicacion?: string | null;
  empresa_id?: number;
}

export interface SimplePrototipo {
  id: string;
  nombre: string;
  precio?: number;
  desarrollo_id?: string;
  // No reference back to desarrollo
}

export interface SimpleUnidad {
  id: string;
  numero: string;
  estado?: string;
  nivel?: string | null;
  prototipo_id?: string;
  // No reference back to prototipo
}

export interface SimpleLead {
  id: string;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  origen?: string | null;
}

// Extended interfaces that can include references to simple types
export interface ExtendedPrototipo extends SimplePrototipo {
  desarrollo?: SimpleDesarrollo | null;
}

export interface ExtendedUnidad extends SimpleUnidad {
  prototipo?: ExtendedPrototipo | null;
}

export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  empresa_id?: number | null;
  notas?: string | null;
  unidad?: ExtendedUnidad | null;
  progreso?: number;
}

export interface Pago {
  id: string;
  comprador_venta_id: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  estado: 'registrado' | 'rechazado' | 'verificado';
  referencia?: string | null;
  notas?: string | null;
  comprobante_url?: string | null;
  created_at: string;
}

export interface Comprador {
  id: string;
  comprador_id: string;
  nombre: string;
  porcentaje: number;
  pagos_realizados?: number;
  total_pagos?: number;
}

export interface VentasFilter {
  desarrollo_id?: string;
  estado?: string;
  busqueda?: string;
  empresa_id?: number | null;
}

// Simplified type for cotizaciones
export interface ExtendedCotizacion {
  id: string;
  created_at: string;
  desarrollo_id: string;
  fecha_finiquito?: string | null;
  fecha_inicio_pagos?: string | null;
  lead_id: string;
  monto_anticipo: number;
  monto_finiquito?: number | null;
  notas?: string | null;
  numero_pagos: number;
  prototipo_id: string;
  usar_finiquito?: boolean | null;
  empresa_id?: number | null;
  // Simple references
  lead?: SimpleLead | null;
  desarrollo?: SimpleDesarrollo | null;
  prototipo?: SimplePrototipo | null;
}
