import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { SimpleDesarrollo, SimplePrototipo } from '@/hooks/useVentas';

// Simplified type to avoid circular references
export interface SimpleCotizacion {
  id: string;
  nombre_cliente?: string;
  email_cliente?: string;
  telefono_cliente?: string;
  estado?: string;
  fecha_creacion?: string;
  ultima_actualizacion?: string;
  prototipo_id?: string;
  desarrollo_id?: string;
  created_by?: string;
  prototipo?: SimplePrototipo;
  desarrollo?: SimpleDesarrollo;
}

export interface CotizacionesFilter {
  desarrollo_id?: string;
  estado?: string;
  busqueda?: string;
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
          nombre_cliente,
          email_cliente,
          telefono_cliente,
          estado,
          fecha_creacion,
          ultima_actualizacion,
          prototipo_id,
          desarrollo_id,
          created_by,
          prototipo: prototipos (id, nombre, precio, desarrollo_id),
          desarrollo: desarrollos (id, nombre, ubicacion, empresa_id)
        `);

      if (filters.desarrollo_id) {
        query = query.eq('desarrollo_id', filters.desarrollo_id);
      }

      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }

      if (filters.busqueda) {
        query = query.ilike('nombre_cliente', `%${filters.busqueda}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching cotizaciones:', error);
        return [];
      }

      return data.map(cotizacion => ({
        id: cotizacion.id,
        nombre_cliente: cotizacion.nombre_cliente,
        email_cliente: cotizacion.email_cliente,
        telefono_cliente: cotizacion.telefono_cliente,
        estado: cotizacion.estado,
        fecha_creacion: cotizacion.fecha_creacion,
        ultima_actualizacion: cotizacion.ultima_actualizacion,
        prototipo_id: cotizacion.prototipo_id,
        desarrollo_id: cotizacion.desarrollo_id,
        created_by: cotizacion.created_by,
        prototipo: cotizacion.prototipo,
        desarrollo: cotizacion.desarrollo
      }));
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
    nombre_cliente: string;
    email_cliente: string;
    telefono_cliente: string;
    prototipo_id?: string;
    desarrollo_id?: string;
    estado?: string;
  }) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .insert([cotizacionData])
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

  const updateCotizacion = async (id: string, updates: Partial<SimpleCotizacion>) => {
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
