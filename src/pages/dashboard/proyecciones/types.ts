
export interface Proyeccion {
  id: string;
  inversion_inicial: number;
  ingresos_totales: number;
  gastos_totales: number;
  beneficio_neto: number;
  tir: number;
  payback: number;
  desarrollo_id?: string;
  desarrollo_nombre?: string;
}
