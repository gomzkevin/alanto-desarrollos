
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
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
  empresa_id?: number | null;
  unidad?: SimpleUnidad;
  compradores?: VentaComprador[];
  totalPagado?: number;
}

const useVentaDetail = (ventaId: string | undefined) => {
  const [compradores, setCompradores] = useState<VentaComprador[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [montoPagado, setMontoPagado] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [compradorVentaId, setCompradorVentaId] = useState<string | null>(null);

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

      // Adding empresa_id with a default value of null if it's not in the database
      const ventaWithEmpresaId = {
        ...venta,
        empresa_id: 'empresa_id' in venta ? venta.empresa_id : null
      };

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
      const { data: compradoresData, error: compradoresError } = await supabase
        .from('compradores_venta')
        .select('*, comprador:comprador_id(id, nombre, email, telefono), vendedor:vendedor_id(id, nombre, email)')
        .eq('venta_id', ventaId);

      if (compradoresError) {
        console.error('Error fetching compradores:', compradoresError);
      }

      // Fetch total pagado
      const { data: pagosData, error: pagosError } = await supabase
        .from('pagos')
        .select('monto')
        .eq('venta_id', ventaId);

      let totalPagado = 0;
      if (pagosData && !pagosError) {
        totalPagado = pagosData.reduce((sum, pago) => sum + pago.monto, 0);
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
        empresa_id: ventaWithEmpresaId.empresa_id,
        unidad: unidad || undefined,
        compradores: compradoresData || [],
        totalPagado: totalPagado,
      };

      return ventaDetallada;
    } catch (error) {
      console.error('Error fetching venta detail:', error);
      return null;
    }
  };

  const { data: venta, isLoading, error, refetch } = useQuery({
    queryKey: ['ventaDetail', ventaId],
    queryFn: fetchVentaDetail,
    enabled: !!ventaId, // Only run the query if ventaId is not undefined
  });

  // Fetch additional data and calculate derived values
  useEffect(() => {
    const fetchData = async () => {
      if (!ventaId || !venta) return;

      try {
        // Fetch compradores
        const { data: compradoresData } = await supabase
          .from('compradores_venta')
          .select('*, comprador:comprador_id(id, nombre, email, telefono), vendedor:vendedor_id(id, nombre, email)')
          .eq('venta_id', ventaId);
        
        setCompradores(compradoresData || []);
        
        // Set the first comprador's ID for payments
        if (compradoresData && compradoresData.length > 0) {
          setCompradorVentaId(compradoresData[0].id);
        }

        // Fetch pagos for all compradores
        const pagosPromises = compradoresData?.map(comprador => 
          supabase
            .from('pagos')
            .select('*')
            .eq('comprador_venta_id', comprador.id)
        ) || [];

        const pagosResults = await Promise.all(pagosPromises);
        const allPagos = pagosResults.flatMap(result => result.data || []);
        
        setPagos(allPagos);
        
        // Calculate total paid
        const totalPagado = allPagos.reduce((sum, pago) => sum + pago.monto, 0);
        setMontoPagado(totalPagado);
        
        // Calculate progress percentage
        if (venta.precio_total > 0) {
          const progresoCalculado = Math.min(Math.round((totalPagado / venta.precio_total) * 100), 100);
          setProgreso(progresoCalculado);
        }
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    fetchData();
  }, [ventaId, venta]);

  return {
    venta,
    compradores,
    pagos,
    isLoading,
    error,
    montoPagado,
    progreso,
    refetch,
    compradorVentaId
  };
};

export default useVentaDetail;
