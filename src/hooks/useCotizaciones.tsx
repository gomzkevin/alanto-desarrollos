
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CotizacionesFilters, SimpleCotizacion } from './types';

// Simplified API for creating cotizaciones
interface CreateCotizacionParams {
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  unidad_id?: string;
  precio_total?: number;
  monto_anticipo: number;
  enganche_porcentaje?: number;
  plazo_meses?: number;
  tasa_interes?: number;
  numero_pagos: number;
  notas?: string;
  usar_finiquito?: boolean;
  fecha_inicio_pagos?: string;
  fecha_finiquito?: string;
  monto_finiquito?: number;
  nombre_cliente?: string;
  email_cliente?: string;
  telefono_cliente?: string;
  estado?: string;
}

export const useCotizaciones = (filters: CotizacionesFilters = {}) => {
  const withRelations = filters.withRelations || false;
  const { estado, desarrolloId, leadId, prototipoId } = filters;

  // Remove withRelations from the filter object before sending to API
  const apiFilters = { ...filters };
  delete apiFilters.withRelations;

  const result = useQuery({
    queryKey: ['cotizaciones', apiFilters],
    queryFn: async () => {
      let query = supabase
        .from('cotizaciones')
        .select(`
          id,
          created_at,
          lead_id,
          desarrollo_id,
          prototipo_id,
          monto_anticipo,
          numero_pagos,
          notas,
          usar_finiquito,
          fecha_inicio_pagos,
          fecha_finiquito,
          monto_finiquito
        `);

      // Apply filters
      if (estado) {
        query = query.eq('estado', estado);
      }

      if (desarrolloId) {
        query = query.eq('desarrollo_id', desarrolloId);
      }

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      if (prototipoId) {
        query = query.eq('prototipo_id', prototipoId);
      }

      const { data: cotizacionesData, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return cotizacionesData as SimpleCotizacion[];
    },
  });

  return {
    cotizaciones: result.data || [],
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
};

export const useCreateCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cotizacionData: CreateCotizacionParams) => {
      // Prepare the data object
      const dbData: any = {
        lead_id: cotizacionData.lead_id,
        desarrollo_id: cotizacionData.desarrollo_id,
        prototipo_id: cotizacionData.prototipo_id,
        unidad_id: cotizacionData.unidad_id,
        monto_anticipo: cotizacionData.monto_anticipo,
        numero_pagos: cotizacionData.numero_pagos,
        notas: cotizacionData.notas,
        usar_finiquito: cotizacionData.usar_finiquito || false,
        fecha_inicio_pagos: cotizacionData.fecha_inicio_pagos,
        fecha_finiquito: cotizacionData.fecha_finiquito,
        monto_finiquito: cotizacionData.monto_finiquito,
        created_at: new Date().toISOString(),
        estado: cotizacionData.estado || 'pendiente'
      };

      const { data, error } = await supabase
        .from('cotizaciones')
        .insert([dbData])
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    },
  });
};

export const useUpdateCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      // Filter out undefined values
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      const { data, error } = await supabase
        .from('cotizaciones')
        .update(filteredData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    },
  });
};

export const useDeleteCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cotizaciones')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    },
  });
};

export default useCotizaciones;
