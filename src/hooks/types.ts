
import { Tables } from '@/integrations/supabase/types';

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
}

// Definición para unidades simplificadas
export interface SimpleUnidad {
  id: string;
  codigo: string;
  precio_venta?: number;
  estado: string;
  prototipo_id: string;
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
  comprador?: SimpleComprador;
  vendedor?: SimpleVendedor;
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
  unidad_id: string;
  precio_total: number;
  enganche_porcentaje: number;
  plazo_meses: number;
  tasa_interes: number;
  fecha_creacion: string;
  estado: string;
  nombre_cliente?: string;
  email_cliente?: string;
  telefono_cliente?: string;
  observaciones?: string;
  vendedor_id?: string;
  lead_id?: string;
  prototipo_id?: string;
  desarrollo_id?: string;
}

// Error genérico para manejo de errores
export interface GenericStringError {
  message: string;
}
