
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VentaDetallada, VentaComprador, SimpleUnidad } from './types';

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

      // Type check venta object
      if (typeof venta !== 'object') {
        console.error('Venta data is not an object:', venta);
        return null;
      }

      // Check if empresa_id exists in the venta object
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
        totalPagado = pagosData.reduce((sum, pago) => {
          const monto = typeof pago.monto === 'number' ? pago.monto : 0;
          return sum + monto;
        }, 0);
      } else if (pagosError) {
        console.error('Error fetching pagos:', pagosError);
      }
      
      // Convert unidad to SimpleUnidad
      const simpleUnidad: SimpleUnidad | undefined = unidad ? {
        id: unidad.id,
        codigo: unidad.numero || 'Sin código',  // Use numero as codigo
        numero: unidad.numero,
        estado: unidad.estado,
        prototipo_id: unidad.prototipo_id,
        precio_venta: unidad.precio_venta
      } : undefined;

      // Convert compradores to VentaComprador
      const ventaCompradores: VentaComprador[] = compradoresData ? compradoresData.map(c => ({
        id: c.id,
        venta_id: c.venta_id,
        comprador_id: c.comprador_id,
        vendedor_id: c.vendedor_id,
        porcentaje: c.porcentaje_propiedad || 0,  // Assign porcentaje_propiedad to porcentaje
        porcentaje_propiedad: c.porcentaje_propiedad,
        monto_comprometido: c.monto_comprometido,
        comprador: c.comprador,
        vendedor: c.vendedor,
        created_at: c.created_at
      })) : [];

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
        unidad: simpleUnidad,
        compradores: ventaCompradores,
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
        
        if (compradoresData) {
          // Convert to VentaComprador
          const ventaCompradores: VentaComprador[] = compradoresData.map(c => ({
            id: c.id,
            venta_id: c.venta_id,
            comprador_id: c.comprador_id,
            vendedor_id: c.vendedor_id,
            porcentaje: c.porcentaje_propiedad || 0,  // Use porcentaje_propiedad as porcentaje
            porcentaje_propiedad: c.porcentaje_propiedad,
            monto_comprometido: c.monto_comprometido,
            comprador: c.comprador,
            vendedor: c.vendedor,
            created_at: c.created_at
          }));
          
          setCompradores(ventaCompradores);
          
          // Set the first comprador's ID for payments
          if (ventaCompradores.length > 0) {
            setCompradorVentaId(ventaCompradores[0].id);
          }

          // Fetch pagos for all compradores
          const pagosPromises = ventaCompradores.map(comprador => 
            supabase
              .from('pagos')
              .select('*')
              .eq('comprador_venta_id', comprador.id)
          );

          const pagosResults = await Promise.all(pagosPromises);
          const allPagos = pagosResults.flatMap(result => result.data || []);
          
          setPagos(allPagos);
          
          // Calculate total paid
          const totalPagado = allPagos.reduce((sum, pago) => {
            // Ensure pago.monto is a number
            const monto = typeof pago.monto === 'number' ? pago.monto : 0;
            return sum + monto;
          }, 0);
          
          setMontoPagado(totalPagado);
          
          // Calculate progress percentage (asegurar que sea un número)
          const precioTotal = typeof venta.precio_total === 'number' ? venta.precio_total : 0;
          if (precioTotal > 0) {
            const progresoCalculado = Math.min(Math.round((totalPagado / precioTotal) * 100), 100);
            setProgreso(progresoCalculado);
          }
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
