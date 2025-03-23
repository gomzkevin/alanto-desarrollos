import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import useUserRole from '@/hooks/useUserRole';

// Define simplified types with no circular references
export interface SimpleUnidad {
  id?: string;
  numero: string;
  estado?: string;
  nivel?: string | null;
  prototipo_id?: string;
  prototipo?: {
    id?: string;
    nombre: string;
    precio?: number;
    desarrollo?: {
      nombre: string;
      ubicacion?: string | null;
      empresa_id?: number;
      id?: string;
    } | null;
  } | null;
}

export interface Venta {
  id: string;
  precio_total: number;
  estado: string;
  es_fraccional: boolean;
  fecha_inicio: string;
  fecha_actualizacion: string;
  unidad_id: string;
  empresa_id?: number | null;
  notas?: string | null;
  unidad?: SimpleUnidad | null;
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
      
      // Fetch basic venta information
      const ventaQuery = supabase.from('ventas')
        .select('id, precio_total, estado, es_fraccional, fecha_inicio, fecha_actualizacion, unidad_id, notas');
      
      // Add empresa_id to the select if it exists
      if (hasEmpresaColumn.data) {
        ventaQuery.select('id, precio_total, estado, es_fraccional, fecha_inicio, fecha_actualizacion, unidad_id, notas, empresa_id');
      }
      
      // Filter by id and empresa_id if necessary
      ventaQuery.eq('id', ventaId);
      if (empresaId && hasEmpresaColumn.data) {
        ventaQuery.eq('empresa_id', empresaId);
      }
      
      const { data: ventaData, error: ventaError } = await ventaQuery.maybeSingle();
      
      if (ventaError) {
        console.error('Error fetching venta details:', ventaError);
        return null;
      }
      
      if (!ventaData) {
        return null;
      }
      
      // Create Venta object with strong typing
      let venta: Venta = {
        id: ventaData.id,
        precio_total: ventaData.precio_total,
        estado: ventaData.estado,
        es_fraccional: ventaData.es_fraccional,
        fecha_inicio: ventaData.fecha_inicio,
        fecha_actualizacion: ventaData.fecha_actualizacion,
        unidad_id: ventaData.unidad_id,
        notas: ventaData.notas,
        unidad: null
      };
      
      // Add empresa_id if it exists
      if ('empresa_id' in ventaData) {
        venta.empresa_id = ventaData.empresa_id as number | null;
      }
      
      // Fetch unidad information separately to avoid deep nesting
      if (ventaData.unidad_id) {
        const { data: unidadData, error: unidadError } = await supabase
          .from('unidades')
          .select('id, numero, estado, nivel, prototipo_id')
          .eq('id', ventaData.unidad_id)
          .maybeSingle();
          
        if (unidadError) {
          console.error('Error fetching unidad details:', unidadError);
        } else if (unidadData) {
          const unidad: SimpleUnidad = {
            id: unidadData.id,
            numero: unidadData.numero,
            estado: unidadData.estado,
            nivel: unidadData.nivel,
            prototipo_id: unidadData.prototipo_id,
            prototipo: null
          };
          
          venta.unidad = unidad;
          
          // If we have a prototipo_id, fetch the prototipo
          if (unidadData.prototipo_id) {
            const { data: prototipoData, error: prototipoError } = await supabase
              .from('prototipos')
              .select('id, nombre, precio, desarrollo_id')
              .eq('id', unidadData.prototipo_id)
              .maybeSingle();
              
            if (prototipoError) {
              console.error('Error fetching prototipo details:', prototipoError);
            } else if (prototipoData) {
              venta.unidad.prototipo = {
                id: prototipoData.id,
                nombre: prototipoData.nombre,
                precio: prototipoData.precio,
                desarrollo: null
              };
              
              // If we have a desarrollo_id, fetch the desarrollo
              if (prototipoData.desarrollo_id) {
                const { data: desarrolloData, error: desarrolloError } = await supabase
                  .from('desarrollos')
                  .select('id, nombre, ubicacion, empresa_id')
                  .eq('id', prototipoData.desarrollo_id)
                  .maybeSingle();
                  
                if (desarrolloError) {
                  console.error('Error fetching desarrollo details:', desarrolloError);
                } else if (desarrolloData) {
                  if (venta.unidad?.prototipo) {
                    venta.unidad.prototipo.desarrollo = {
                      id: desarrolloData.id,
                      nombre: desarrolloData.nombre,
                      ubicacion: desarrolloData.ubicacion,
                      empresa_id: desarrolloData.empresa_id as number
                    };
                  }
                }
              }
            }
          }
        }
      }
      
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
    if (!ventaId || !venta) return [];
    
    setLoading(true);
    try {
      // First verify the venta belongs to the user's empresa
      if (empresaId && venta) {
        // Check if venta has empresa_id property
        const ventaEmpresaId = venta.empresa_id;
        
        if (ventaEmpresaId !== undefined && ventaEmpresaId !== null && ventaEmpresaId !== empresaId) {
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

      if (error) {
        console.error('Error fetching compradores:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Count pagos for each comprador
      const compradoresWithPagos = await Promise.all(
        data.map(async (item) => {
          const { count, error: pagosError } = await supabase
            .from('pagos')
            .select('id', { count: 'exact', head: true })
            .eq('comprador_venta_id', item.id)
            .eq('estado', 'registrado');
            
          if (pagosError) {
            console.error('Error counting pagos:', pagosError);
            return {
              id: item.id,
              comprador_id: item.comprador_id,
              nombre: item.comprador?.nombre || 'Comprador sin nombre',
              porcentaje: item.porcentaje_propiedad,
              pagos_realizados: 0,
            };
          }
            
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

      if (error) {
        console.error('Error fetching pagos:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Map the data to ensure estados conform to the expected type
      const typedPagos: Pago[] = data.map(pago => ({
        id: pago.id,
        comprador_venta_id: pago.comprador_venta_id,
        monto: pago.monto,
        fecha: pago.fecha,
        metodo_pago: pago.metodo_pago,
        estado: pago.estado === 'rechazado' ? 'rechazado' : 'registrado',
        referencia: pago.referencia,
        notas: pago.notas,
        comprobante_url: pago.comprobante_url,
        created_at: pago.created_at
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

  const progreso = venta && venta.precio_total && venta.precio_total > 0
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
