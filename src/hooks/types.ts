
// Basic types with simplified structures to avoid deep recursion
export interface SimpleDesarrollo {
  id?: string;
  nombre: string;
  ubicacion?: string | null;
  empresa_id?: number;
}

export interface SimplePrototipo {
  id?: string;
  nombre: string;
  precio?: number;
  desarrollo_id?: string;
  desarrollo?: SimpleDesarrollo | null;
}

export interface SimpleUnidad {
  id?: string;
  numero: string;
  estado?: string;
  nivel?: string | null;
  prototipo_id?: string;
  prototipo?: SimplePrototipo | null;
}

// Simplified types for compradores and vendedores
export interface SimpleComprador {
  id: string;
  nombre?: string;
  email?: string;
  telefono?: string;
}

export interface SimpleVendedor {
  id: string;
  nombre?: string;
  email?: string;
}

export interface VentaComprador {
  id: string;
  venta_id: string;
  comprador_id: string;
  vendedor_id?: string;
  porcentaje_propiedad: number;
  monto_comprometido: number;
  comprador?: SimpleComprador;
  vendedor?: SimpleVendedor;
}

export interface VentaDetallada {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  notas?: string;
  empresa_id?: number | null;
  unidad?: SimpleUnidad;
  compradores?: VentaComprador[];
  totalPagado?: number;
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
