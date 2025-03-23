
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { SimpleDesarrollo, SimplePrototipo } from './useVentas';

// Simplified type to avoid circular references
export interface SimpleCotizacion {
  id: string;
  lead_id?: string;
  desarrollo_id?: string;
  prototipo_id?: string;
  monto_anticipo?: number;
  numero_pagos?: number;
  usar_finiquito?: boolean;
  monto_finiquito?: number;
  fecha_inicio_pagos?: string;
  fecha_finiquito?: string;
  notas?: string;
  estado?: string;
  created_at?: string;
  // Nested relations as simple objects with minimal properties
  lead?: {
    id: string;
    nombre?: string;
    email?: string;
    telefono?: string;
    origen?: string;
  };
  prototipo?: SimplePrototipo;
  desarrollo?: SimpleDesarrollo;
}

export interface CotizacionesFilter {
  desarrollo_id?: string;
  estado?: string;
  busqueda?: string;
  withRelations?: boolean;
}

const useCotizaciones = (filters: CotizacionesFilter = {}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const fetchCotizaciones = async (): Promise<SimpleCotizacion[]> => {
    try {
      let query = supabase
        .from('cotizaciones')
        .select(`
          id,
          lead_id,
          desarrollo_id,
          prototipo_id,
          monto_anticipo,
          numero_pagos,
          usar_finiquito,
          monto_finiquito,
          fecha_inicio_pagos,
          fecha_finiquito,
          notas,
          estado,
          created_at
        `);

      if (filters.desarrollo_id) {
        query = query.eq('desarrollo_id', filters.desarrollo_id);
      }

      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }

      if (filters.busqueda) {
        // We'll join with leads table to search by name
        query = supabase
          .from('cotizaciones')
          .select(`
            id,
            lead_id,
            desarrollo_id,
            prototipo_id,
            monto_anticipo,
            numero_pagos,
            usar_finiquito,
            monto_finiquito,
            fecha_inicio_pagos,
            fecha_finiquito,
            notas,
            estado,
            created_at,
            lead:lead_id(id, nombre, email, telefono)
          `)
          .ilike('lead.nombre', `%${filters.busqueda}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cotizaciones:', error);
        return [];
      }

      let cotizaciones: SimpleCotizacion[] = data || [];

      // If withRelations is true, fetch the related data
      if (filters.withRelations && cotizaciones.length > 0) {
        const cotizacionesWithRelations = await Promise.all(
          cotizaciones.map(async (cotizacion) => {
            if (!cotizacion) return null;
            
            let leadData = null;
            let prototipoData = null;
            let desarrolloData = null;

            // Fetch lead data if lead_id exists
            if (cotizacion.lead_id) {
              const { data: lead } = await supabase
                .from('leads')
                .select('id, nombre, email, telefono, origen')
                .eq('id', cotizacion.lead_id)
                .single();
              leadData = lead;
            }

            // Fetch prototipo data if prototipo_id exists
            if (cotizacion.prototipo_id) {
              const { data: prototipo } = await supabase
                .from('prototipos')
                .select('id, nombre, precio, desarrollo_id')
                .eq('id', cotizacion.prototipo_id)
                .single();
              prototipoData = prototipo;
            }

            // Fetch desarrollo data if desarrollo_id exists
            if (cotizacion.desarrollo_id) {
              const { data: desarrollo } = await supabase
                .from('desarrollos')
                .select('id, nombre, ubicacion, empresa_id')
                .eq('id', cotizacion.desarrollo_id)
                .single();
              desarrolloData = desarrollo;
            }

            return {
              ...cotizacion,
              lead: leadData,
              prototipo: prototipoData,
              desarrollo: desarrolloData
            } as SimpleCotizacion;
          })
        );

        return cotizacionesWithRelations.filter((c): c is SimpleCotizacion => c !== null);
      }

      return cotizaciones;
    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
      return [];
    }
  };

  const { data: cotizaciones = [], isLoading, error, refetch } = useQuery({
    queryKey: ['cotizaciones', filters],
    queryFn: fetchCotizaciones,
  });

  const createCotizacion = async (cotizacionData: {
    lead_id: string;
    desarrollo_id: string;
    prototipo_id: string;
    monto_anticipo: number;
    numero_pagos: number;
    usar_finiquito?: boolean;
    monto_finiquito?: number;
    fecha_inicio_pagos?: string;
    fecha_finiquito?: string;
    notas?: string;
    estado?: string;
  }) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .insert(cotizacionData)
        .select();

      if (error) throw error;
      toast({
        title: "Cotización creada",
        description: "La cotización ha sido creada exitosamente",
      });
      await refetch();
      return data;
    } catch (error) {
      console.error('Error creating cotizacion:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cotización",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateCotizacion = async (id: string, updates: Partial<{
    lead_id: string;
    desarrollo_id: string;
    prototipo_id: string;
    monto_anticipo: number;
    numero_pagos: number;
    usar_finiquito: boolean;
    monto_finiquito: number;
    fecha_inicio_pagos: string;
    fecha_finiquito: string;
    notas: string;
    estado: string;
  }>) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;
      toast({
        title: "Cotización actualizada",
        description: "La cotización ha sido actualizada exitosamente",
      });
      await refetch();
      return data;
    } catch (error) {
      console.error('Error updating cotizacion:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cotización",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    cotizaciones,
    isLoading,
    error,
    refetch,
    createCotizacion,
    updateCotizacion,
    isCreating,
    isUpdating
  };
};

export default useCotizaciones;
