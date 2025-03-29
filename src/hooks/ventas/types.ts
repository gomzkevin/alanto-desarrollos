
export type Venta = {
  id: string;
  created_at: string;
  lead_id?: string;
  unidad_id: string;
  estado: string;
  precio_total: number;
  fecha_inicio: string;
  es_fraccional: boolean;
  fecha_actualizacion: string;
  prototipo?: {
    id: string;
    nombre: string;
    precio: number;
    desarrollo: {
      id: string;
      nombre: string;
      empresa_id: number;
    };
  };
  unidad?: {
    id: string; 
    numero: string;
    prototipo_id: string;
  };
};

export type VentasFilter = {
  desarrolloId?: string;
  prototipoId?: string;
  limit?: number;
  estado?: string;
};

export type VentaCreate = {
  unidad_id: string;
  precio_total: number;
  es_fraccional: boolean;
  estado?: string;
  notas?: string;
  fecha_inicio?: string;
};

export type VentaUpdate = {
  estado?: string;
  precio_total?: number;
  es_fraccional?: boolean;
  notas?: string;
};
