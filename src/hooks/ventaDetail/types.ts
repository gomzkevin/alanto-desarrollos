
export type Comprador = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  porcentaje_propiedad: number;
  monto_comprometido: number;
};

export type VentaWithDetail = {
  id: string;
  unidad_id: string;
  estado: string;
  precio_total: number;
  fecha_inicio: string;
  es_fraccional: boolean;
  created_at: string;
  fecha_actualizacion: string;
  notas?: string;
  lead_id?: string;
  unidad: {
    id: string;
    numero: string;
    prototipo?: {
      id?: string;
      nombre?: string;
      precio?: number;
      desarrollo?: {
        id?: string;
        nombre?: string;
        empresa_id?: number;
      };
    };
  };
};
