
import { Tables } from '@/integrations/supabase/types';

// Definición para interfaces simples
export interface SimpleDesarrollo {
  id: string;
  nombre: string;
  ubicacion: string;
  imagen_url?: string;
}

export interface SimplePrototipo {
  id: string;
  nombre: string;
  precio: number;
  desarrollo_id: string;
  desarrollo?: SimpleDesarrollo;
}

// Definición para ventas
export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  notas: string | null;
  empresa_id?: number | null;
  unidad?: SimpleUnidad;
}

// Definición para unidades simplificadas
export interface SimpleUnidad {
  id: string;
  codigo: string;
  numero?: string;
  precio_venta?: number;
  estado: string;
  prototipo_id: string;
  prototipo?: SimplePrototipo;
}

// Definición para compradores simplificados
export interface SimpleComprador {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
}

// Definición para vendedores simplificados
export interface SimpleVendedor {
  id: string;
  nombre: string;
  email: string;
}

// Definir relación compradores-venta
export interface VentaComprador {
  id: string;
  venta_id: string;
  comprador_id: string;
  vendedor_id?: string;
  porcentaje: number;
  porcentaje_propiedad?: number;
  monto_comprometido?: number;
  comprador?: SimpleComprador;
  vendedor?: SimpleVendedor;
  created_at?: string;
}

// Definir la venta con detalles
export interface VentaDetallada extends Venta {
  unidad?: SimpleUnidad;
  compradores: VentaComprador[];
  totalPagado: number;
}

// Definición para cotizaciones
export interface SimpleCotizacion {
  id: string;
  created_at?: string;
  unidad_id?: string;
  precio_total: number;
  enganche_porcentaje?: number;
  plazo_meses?: number;
  tasa_interes?: number;
  fecha_creacion?: string;
  estado?: string;
  nombre_cliente?: string;
  email_cliente?: string;
  telefono_cliente?: string;
  observaciones?: string;
  vendedor_id?: string;
  lead_id?: string;
  prototipo_id?: string;
  desarrollo_id?: string;
  monto_anticipo?: number;
  numero_pagos?: number;
  notas?: string;
  usar_finiquito?: boolean;
  fecha_inicio_pagos?: string;
  fecha_finiquito?: string;
  monto_finiquito?: number;
  lead?: any;
  desarrollo?: any;
  prototipo?: any;
}

// Filtros para cotizaciones
export interface CotizacionesFilters {
  estado?: string;
  leadId?: string;
  unidadId?: string;
  prototipoId?: string;
  desarrolloId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  withRelations?: boolean;
}

// Filtros para ventas
export interface VentasFilters {
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  unidadId?: string;
  compradorId?: string;
  desarrolloId?: string;
  empresa_id?: number;
}

// Error genérico para manejo de errores
export interface GenericStringError {
  message: string;
}
