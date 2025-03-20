
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export interface VentaBasica {
  id: string;
  unidad_id: string;
  es_fraccional: boolean;
  precio_total: number;
  estado: string;
  fecha_inicio: string;
  fecha_actualizacion: string;
  notas: string | null;
  created_at: string;
  // Campos incluidos de relaciones
  unidad?: {
    id: string;
    numero: string;
    estado: string;
    prototipo_id: string;
    prototipo?: {
      id: string;
      nombre: string;
      tipo: string;
      desarrollo_id: string;
      desarrollo?: {
        id: string;
        nombre: string;
      };
    };
  };
  compradores?: CompradoresVenta[];
  progreso?: number;
}

export interface CompradoresVenta {
  id: string;
  venta_id: string;
  comprador_id: string;
  porcentaje_propiedad: number;
  vendedor_id: string | null;
  monto_comprometido: number;
  created_at: string;
  comprador?: {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
  };
  vendedor?: {
    id: string;
    nombre: string;
  };
  pagos?: Pago[];
  plan_pago?: PlanPago;
  total_pagado?: number;
  porcentaje_pagado?: number;
}

export interface Pago {
  id: string;
  comprador_venta_id: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  referencia: string | null;
  comprobante_url: string | null;
  estado: string;
  notas: string | null;
  registrado_por: string | null;
  created_at: string;
}

export interface PlanPago {
  id: string;
  comprador_venta_id: string;
  monto_total: number;
  plazo_meses: number;
  monto_mensual: number | null;
  dia_pago: number | null;
  anticipo: number | null;
  fecha_anticipo: string | null;
  incluye_finiquito: boolean | null;
  monto_finiquito: number | null;
  fecha_finiquito: string | null;
  created_at: string;
}

export interface UseVentasOptions {
  limit?: number;
  estado?: string;
  desarrolloId?: string;
  unidadId?: string;
  ventaId?: string;
  includeRelations?: boolean;
  includeCompradores?: boolean;
  includePagos?: boolean;
}

export const useVentas = (options: UseVentasOptions = {}) => {
  const { toast } = useToast();
  const { empresaId } = useUserRole();
  const { 
    limit, 
    estado, 
    desarrolloId, 
    unidadId, 
    ventaId,
    includeRelations = true,
    includeCompradores = true,
    includePagos = false
  } = options;

  // Construir la consulta base
  const buildQuery = async () => {
    let query = supabase
      .from('ventas')
      .select(`
        *,
        unidad:unidades(
          id, 
          numero, 
          estado, 
          prototipo_id,
          prototipo:prototipos(
            id, 
            nombre, 
            tipo, 
            desarrollo_id,
            desarrollo:desarrollos(
              id,
              nombre
            )
          )
        )
        ${includeCompradores ? `,
        compradores:compradores_venta(
          *,
          comprador:leads(id, nombre, email, telefono),
          vendedor:usuarios(id, nombre)
          ${includePagos ? `,
          pagos:pagos(*),
          plan_pago:plan_pagos(*)
          ` : ''}
        )` : ''}
      `);

    // Aplicar filtros
    if (ventaId) {
      query = query.eq('id', ventaId);
    }

    if (unidadId) {
      query = query.eq('unidad_id', unidadId);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (desarrolloId && includeRelations) {
      query = query.filter('unidad.prototipo.desarrollo_id', 'eq', desarrolloId);
    }

    if (empresaId && includeRelations) {
      query = query.filter('unidad.prototipo.desarrollo.empresa_id', 'eq', empresaId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    // Ordenar por fecha de actualización descendente
    query = query.order('fecha_actualizacion', { ascending: false });

    return query;
  };

  // Fetch ventas
  const fetchVentas = async (): Promise<VentaBasica[]> => {
    try {
      const query = await buildQuery();
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ventas:', error);
        throw error;
      }

      // Procesar los datos para añadir información calculada
      const ventasWithProgress = data.map((venta: any) => {
        // Si no hay compradores, devolver la venta tal cual
        if (!includeCompradores || !venta.compradores || venta.compradores.length === 0) {
          return {
            ...venta,
            progreso: 0
          };
        }

        // Calcular el progreso total de pagos
        const compradores = venta.compradores.map((comprador: any) => {
          if (!includePagos || !comprador.pagos) {
            return comprador;
          }

          // Calcular el total pagado por este comprador
          const totalPagado = comprador.pagos.reduce(
            (sum: number, pago: any) => 
              pago.estado === 'verificado' ? sum + pago.monto : sum, 
            0
          );

          // Calcular el porcentaje pagado
          const porcentajePagado = comprador.monto_comprometido > 0 
            ? (totalPagado / comprador.monto_comprometido) * 100 
            : 0;

          return {
            ...comprador,
            total_pagado: totalPagado,
            porcentaje_pagado: Math.min(100, porcentajePagado)
          };
        });

        // Calcular el progreso total de la venta
        const totalComprometido = compradores.reduce(
          (sum: number, c: any) => sum + c.monto_comprometido, 
          0
        );
        
        const totalPagado = compradores.reduce(
          (sum: number, c: any) => sum + (c.total_pagado || 0), 
          0
        );
        
        const progresoVenta = totalComprometido > 0 
          ? (totalPagado / totalComprometido) * 100 
          : 0;

        return {
          ...venta,
          compradores,
          progreso: Math.min(100, progresoVenta)
        };
      });

      return ventasWithProgress;
    } catch (error) {
      console.error('Error in fetchVentas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las ventas',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Usar React Query para manejar y cachear los datos
  const { 
    data: ventas = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: [
      'ventas', 
      limit, 
      estado, 
      desarrolloId, 
      unidadId, 
      ventaId, 
      includeRelations,
      includeCompradores,
      includePagos
    ],
    queryFn: fetchVentas,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    ventas,
    isLoading,
    error,
    refetch
  };
};

export default useVentas;
