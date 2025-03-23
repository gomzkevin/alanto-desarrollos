
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venta, VentaComprador, Pago } from './types';

const useVentaDetail = (ventaId: string | undefined) => {
  const [venta, setVenta] = useState<Venta | null>(null);
  const [compradores, setCompradores] = useState<VentaComprador[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [montoPagado, setMontoPagado] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [compradorVentaId, setCompradorVentaId] = useState<string | null>(null);

  // Main query to fetch the venta data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['venta', ventaId],
    queryFn: async () => {
      if (!ventaId) return null;

      // Fetch the venta
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(*)
        `)
        .eq('id', ventaId)
        .single();

      if (ventaError) {
        console.error('Error fetching venta:', ventaError);
        return null;
      }

      // Fetch compradores
      const { data: compradoresData, error: compradoresError } = await supabase
        .from('compradores_ventas')
        .select(`
          *,
          comprador:compradores(*),
          vendedor:vendedores(*)
        `)
        .eq('venta_id', ventaId);

      if (compradoresError) {
        console.error('Error fetching compradores:', compradoresError);
        return { venta: ventaData, compradores: [] };
      }

      // Fetch pagos
      const { data: pagosData, error: pagosError } = await supabase
        .from('pagos')
        .select('*')
        .eq('venta_id', ventaId);

      if (pagosError) {
        console.error('Error fetching pagos:', pagosError);
        return { 
          venta: ventaData, 
          compradores: compradoresData, 
          pagos: [] 
        };
      }

      return { 
        venta: ventaData, 
        compradores: compradoresData, 
        pagos: pagosData 
      };
    },
    enabled: !!ventaId,
  });

  useEffect(() => {
    if (data) {
      setVenta(data.venta as Venta);
      
      // Map porcentaje_propiedad to porcentaje for compatibility
      const mappedCompradores = data.compradores?.map(comp => ({
        ...comp,
        porcentaje: comp.porcentaje_propiedad
      })) || [];
      
      setCompradores(mappedCompradores as VentaComprador[]);
      setPagos(data.pagos || []);

      // Set first comprador as default if available
      if (mappedCompradores.length > 0) {
        setCompradorVentaId(mappedCompradores[0].id);
      }

      // Calculate the amount paid and progress
      const totalPagado = (data.pagos || []).reduce((sum, pago) => sum + (pago.monto || 0), 0);
      setMontoPagado(totalPagado);

      if (data.venta?.precio_total) {
        const progresoCalculado = (totalPagado / data.venta.precio_total) * 100;
        setProgreso(Math.min(100, progresoCalculado));
      }
    }
  }, [data]);

  return {
    venta,
    compradores,
    pagos,
    isLoading,
    montoPagado,
    progreso,
    refetch,
    compradorVentaId,
  };
};

export default useVentaDetail;
