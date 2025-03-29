
export type Venta = {
  id: string;
  created_at: string;
  lead_id: string;
  unidad_id: string;
  estado: string;
  precio_total: number;
  fecha_inicio: string;
  es_fraccional: boolean;
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
