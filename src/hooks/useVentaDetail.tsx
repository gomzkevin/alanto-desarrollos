
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import useUserRole from '@/hooks/useUserRole';

// Define simplified types to avoid deep recursion
export interface SimpleUnidad {
  id?: string;
  numero: string;
  estado?: string;
  nivel?: string | null;
  prototipo?: {
    id?: string;
    nombre: string;
    precio?: number;
    desarrollo?: {
      nombre: string;
      ubicacion?: string | null;
      empresa_id?: number;
      id?: string;
    };
  };
}

export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  empresa_id?: number;
  notas?: string | null;
  unidad?: SimpleUnidad;
}

interface Comprador {
  id: string;
  comprador_id: string;
  nombre: string;
  porcentaje: number;
  pagos_realizados?: number;
  total_pagos?: number;
}

export interface Pago {
  id: string;
  comprador_venta_id: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  estado: 'registrado' | 'rechazado';
  referencia?: string | null;
  notas?: string | null;
  comprobante_url?: string | null;
  created_at: string;
}

export const useVentaDetail = (ventaId?: string) => {
  const [compradores, setCompradores] = useState<Comprador[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const { empresaId } = useUserRole();
  
  // Simplified fetch function to avoid deep type recursion
  const fetchVentaDetail = async (): Promise<Venta | null> => {
    if (!ventaId) return null;
    
    try {
      console.log('Fetching venta details with id:', ventaId, 'and empresa_id:', empresaId);
      
      // First, check if the ventas table has empresa_id column
      const hasEmpresaColumn = await supabase.rpc('has_column', {
        table_name: 'ventas',
        column_name: 'empresa_id'
      });
      
      // Build select query based on column existence
      let query = supabase.from('ventas').select(`
        id, precio_total, estado, es_fraccional, fecha_inicio, fecha_actualizacion, unidad_id, notas
        ${hasEmpresaColumn.data ? ', empresa_id' : ''}
      `).eq('id', ventaId);
      
      // Add empresa_id filter if available and column exists
      if (empresaId && hasEmpresaColumn.data) {
        query = query.eq('empresa_id', empresaId);
      }
      
      const { data: ventaData, error: ventaError } = await query.maybeSingle();
      
      if (ventaError) {
        console.error('Error fetching venta details:', ventaError);
        return null;
      }
      
      if (!ventaData) {
        return null;
      }
      
      // Fetch unidad information separately to avoid deep nesting
      const { data: unidadData, error: unidadError } = await supabase
        .from('unidades')
        .select(`
          id, numero, estado, nivel,
          prototipo:prototipos (
            id, nombre, precio,
            desarrollo:desarrollos (
              id, nombre, ubicacion, empresa_id
            )
          )
        `)
        .eq('id', ventaData.unidad_id)
        .maybeSingle();
        
      if (unidadError) {
        console.error('Error fetching unidad details:', unidadError);
      }
      
      // Combine the data
      const venta: Venta = {
        ...ventaData,
        unidad: unidadData || undefined
      };
      
      return venta;
    } catch (error) {
      console.error('Error al obtener detalles de venta:', error);
      return null;
    }
  };

  const { data: venta, isLoading: isVentaLoading, refetch: refetchVenta } = useQuery({
    queryKey: ['venta', ventaId, empresaId],
    queryFn: fetchVentaDetail,
    enabled: !!ventaId,
  });

  // Fetch compradores with lead information
  const fetchCompradores = async (): Promise<Comprador[]> => {
    if (!ventaId) return [];
    
    setLoading(true);
    try {
      // First verify the venta belongs to the user's empresa
      if (empresaId && venta) {
        // Check if venta has empresa_id property
        const ventaEmpresaId = 'empresa_id' in venta ? venta.empresa_id : undefined;
        
        if (ventaEmpresaId !== undefined && ventaEmpresaId !== empresaId) {
          console.log('Venta does not belong to user empresa:', ventaEmpresaId, empresaId);
          return [];
        }
      }
      
      const { data, error } = await supabase
        .from('compradores_venta')
        .select(`
          *,
          comprador:leads(id, nombre)
        `)
        .eq('venta_id', ventaId);

      if (error) throw error;

      // Count pagos for each comprador
      const compradoresWithPagos = await Promise.all(
        data.map(async (item) => {
          const { count, error: pagosError } = await supabase
            .from('pagos')
            .select('id', { count: 'exact', head: true })
            .eq('comprador_venta_id', item.id)
            .eq('estado', 'registrado');
            
          return {
            id: item.id,
            comprador_id: item.comprador_id,
            nombre: item.comprador?.nombre || 'Comprador sin nombre',
            porcentaje: item.porcentaje_propiedad,
            pagos_realizados: count || 0,
          };
        })
      );

      return compradoresWithPagos;
    } catch (error) {
      console.error('Error al obtener compradores:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const { data: compradoresData = [], isLoading: isCompradoresLoading, refetch: refetchCompradores } = useQuery({
    queryKey: ['compradores', ventaId, venta?.empresa_id],
    queryFn: fetchCompradores,
    enabled: !!ventaId && !!venta,
  });

  // Set compradores to state
  useEffect(() => {
    if (compradoresData) {
      setCompradores(compradoresData);
    }
  }, [compradoresData]);

  // Fetch all pagos for this venta (regardless of comprador)
  const fetchPagos = async (): Promise<Pago[]> => {
    if (!ventaId || !compradoresData.length) return [];
    
    try {
      // Get all comprador_venta_ids for this venta
      const compradorVentaIds = compradoresData.map(c => c.id);
      
      if (!compradorVentaIds.length) return [];
      
      const { data, error } = await supabase
        .from('pagos')
        .select('*')
        .in('comprador_venta_id', compradorVentaIds)
        .order('fecha', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure estados conform to the expected type
      const typedPagos: Pago[] = (data || []).map(pago => ({
        ...pago,
        estado: pago.estado === 'rechazado' ? 'rechazado' : 'registrado'
      }));
      
      return typedPagos;
    } catch (error) {
      console.error('Error al obtener pagos de la venta:', error);
      return [];
    }
  };

  const { data: pagosData = [], isLoading: isPagosLoading, refetch: refetchPagos } = useQuery({
    queryKey: ['pagos-venta', ventaId, compradoresData],
    queryFn: fetchPagos,
    enabled: !!ventaId && compradoresData.length > 0,
  });

  // Update pagos in state when data changes
  useEffect(() => {
    setPagos(pagosData);
  }, [pagosData]);

  // Calculate payment progress
  const montoPagado = pagos.reduce((total, pago) => {
    return pago.estado === 'registrado' ? total + pago.monto : total;
  }, 0);

  const progreso = venta?.precio_total
    ? Math.round((montoPagado / venta.precio_total) * 100)
    : 0;

  // Refetch all data
  const refetch = async () => {
    await refetchVenta();
    await refetchCompradores();
    await refetchPagos();
  };

  const compradorVentaId = compradores.length > 0 ? compradores[0].id : '';

  return {
    venta,
    compradores,
    pagos,
    isLoading: isVentaLoading || isCompradoresLoading || isPagosLoading || loading,
    montoPagado,
    progreso,
    refetch,
    compradorVentaId
  };
};

export default useVentaDetail;
