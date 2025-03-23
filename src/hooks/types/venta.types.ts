
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
  desarrollo?: SimpleDesarrollo | null;
}

export interface SimpleUnidad {
  id: string;
  numero: string;
  estado?: string;
  nivel?: string | null;
  prototipo_id?: string;
  prototipo?: SimplePrototipo | null;
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
  unidad?: SimpleUnidad | null;
  progreso?: number;
}

export interface Pago {
  id: string;
  comprador_venta_id: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  estado: 'registrado' | 'rechazado';
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
