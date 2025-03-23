// Venta types
export interface Venta {
  id: string;
  unidad_id: string;
  precio_total: number;
  estado: string;
  fecha_inicio: string;
  fecha_actualizacion: string;
  es_fraccional: boolean;
  notas?: string;
  empresa_id?: string;
  unidad?: SimpleUnidad;
}

export interface VentasFilters {
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  unidadId?: string;
  compradorId?: string;
  desarrolloId?: string;
  empresa_id?: string;
}

export interface SimpleUnidad {
  id: string;
  codigo: string;
  prototipo_id?: string;
  prototipo?: {
    nombre: string;
  };
  numero?: string;
  nivel?: string;
}

export interface VentaComprador {
  id: string;
  venta_id: string;
  comprador_id: string;
  porcentaje: number;
  porcentaje_propiedad?: number;
  vendedor_id?: string;
  comprador?: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
  };
  vendedor?: {
    id: string;
    nombre: string;
  };
}

export interface Pago {
  id: string;
  venta_id: string;
  comprador_venta_id: string;
  monto: number;
  fecha: string;
  concepto: string;
  notas?: string;
  forma_pago?: string;
  referencia?: string;
}

// Cotizacion types
export interface SimpleCotizacion {
  id: string;
  created_at: string;
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  unidad_id?: string;
  precio_total: number;
  enganche_porcentaje: number;
  plazo_meses: number;
  tasa_interes: number;
  monto_anticipo?: number;
  numero_pagos?: number;
  estado?: string;
  lead?: SimpleLead;
  desarrollo?: SimpleDesarrollo;
  prototipo?: SimplePrototipo;
}

export interface CotizacionesFilters {
  estado?: string;
  desarrolloId?: string;
  leadId?: string;
  prototipoId?: string;
  withRelations?: boolean;
}

export interface SimpleLead {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
}

export interface SimpleDesarrollo {
  id: string;
  nombre: string;
}

export interface SimplePrototipo {
  id: string;
  nombre: string;
}
