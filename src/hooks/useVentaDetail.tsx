import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SimpleUnidad } from '@/hooks/useVentas';

// Simplified types to avoid circular references
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
  empresa_id?: number;
  unidad?: SimpleUnidad;
  compradores?: VentaComprador[];
  totalPagado?: number;
}

const useVentaDetail = (ventaId: string | undefined) => {
  const fetchVentaDetail = async (): Promise<VentaDetallada | null> => {
    if (!ventaId) {
      return null;
    }

    try {
      const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .select('*')
        .eq('id', ventaId)
        .single();

      if (ventaError) {
        console.error('Error fetching venta:', ventaError);
        return null;
      }

      if (!venta) {
        return null;
      }

      // Fetch unidad details
      const { data: unidad, error: unidadError } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', venta.unidad_id)
        .single();

      if (unidadError) {
        console.error('Error fetching unidad:', unidadError);
      }

      // Fetch compradores
      const { data: compradores, error: compradoresError } = await supabase
        .from('compradores_venta')
        .select('*, comprador:comprador_id(id, nombre, email, telefono), vendedor:vendedor_id(id, nombre, email)')
        .eq('venta_id', ventaId);

      if (compradoresError) {
        console.error('Error fetching compradores:', compradoresError);
      }

      // Fetch total pagado
      const { data: pagos, error: pagosError } = await supabase
        .from('pagos')
        .select('monto')
        .eq('venta_id', ventaId);

      let totalPagado = 0;
      if (pagos && !pagosError) {
        totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
      } else if (pagosError) {
        console.error('Error fetching pagos:', pagosError);
      }

      const ventaDetallada: VentaDetallada = {
        id: venta.id,
        precio_total: venta.precio_total,
        estado: venta.estado,
        es_fraccional: venta.es_fraccional,
        fecha_inicio: venta.fecha_inicio,
        fecha_actualizacion: venta.fecha_actualizacion,
        unidad_id: venta.unidad_id,
        notas: venta.notas,
        empresa_id: venta.empresa_id,
        unidad: unidad || null,
        compradores: compradores || [],
        totalPagado: totalPagado,
      };

      return ventaDetallada;
    } catch (error) {
      console.error('Error fetching venta detail:', error);
      return null;
    }
  };

  const { data: ventaDetail, isLoading, error, refetch } = useQuery({
    queryKey: ['ventaDetail', ventaId],
    queryFn: fetchVentaDetail,
    enabled: !!ventaId, // Only run the query if ventaId is not undefined
  });

  return {
    ventaDetail,
    isLoading,
    error,
    refetch,
  };
};

export default useVentaDetail;
