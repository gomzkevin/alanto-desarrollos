
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

// Define the interface with all required fields to match the database structure
export interface Desarrollo {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  latitud?: number | null;
  longitud?: number | null;
  estado?: string | null;
  fecha_inicio?: string | null;
  fecha_finalizacion_estimada?: string | null;
  empresa_id: number;
  user_id: string;
  total_unidades: number;
  unidades_disponibles: number;
  avance_porcentaje: number;
  comision_operador: number;
  moneda: string;
  fecha_entrega: string | null;
  adr_base: number;
  ocupacion_anual: number;
  es_impuestos_porcentaje: boolean;
  impuestos: number;
  es_gastos_variables_porcentaje: boolean;
  gastos_variables: number;
  gastos_fijos: number;
  es_gastos_fijos_porcentaje: boolean;
  es_mantenimiento_porcentaje: boolean;
  mantenimiento_valor: number;
  imagen_url: string | null;
  amenidades: string[] | null;
  created_at?: string;
  updated_at?: string;
  cover_image?: string;
  logo?: string;
}

// Default empty options
const DEFAULT_OPTIONS = {
  onSuccess: () => {},
  onMutationSuccess: () => {},
  onError: (error: Error) => {
    console.error("Error in useDesarrollos:", error);
  }
};

export interface UseDesarrollosOptions {
  onSuccess?: (data: Desarrollo[]) => void;
  onMutationSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDesarrollos = (options: UseDesarrollosOptions = DEFAULT_OPTIONS) => {
  const { userId, empresaId } = useUserRole();
  const queryClient = useQueryClient();
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const { data: desarrollos = [], isLoading, error, refetch } = useQuery({
    queryKey: ['desarrollos', empresaId],
    queryFn: async () => {
      try {
        console.log('Fetching desarrollos for empresa_id:', empresaId);
        
        // Solo obtener desarrollos de la empresa del usuario
        let query = supabase
          .from('desarrollos')
          .select('*');
          
        if (empresaId) {
          query = query.eq('empresa_id', empresaId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Map data to ensure all required fields are present
        return (data || []).map(desarrollo => ({
          id: desarrollo.id,
          nombre: desarrollo.nombre,
          descripcion: desarrollo.descripcion || '',
          ubicacion: desarrollo.ubicacion,
          latitud: desarrollo.latitud !== undefined ? desarrollo.latitud : null,
          longitud: desarrollo.longitud !== undefined ? desarrollo.longitud : null,
          estado: desarrollo.estado || null,
          fecha_inicio: desarrollo.fecha_inicio || null,
          fecha_finalizacion_estimada: desarrollo.fecha_finalizacion_estimada || null,
          empresa_id: desarrollo.empresa_id,
          user_id: desarrollo.user_id || '',
          total_unidades: desarrollo.total_unidades || 0,
          unidades_disponibles: desarrollo.unidades_disponibles || 0,
          avance_porcentaje: desarrollo.avance_porcentaje || 0,
          comision_operador: desarrollo.comision_operador || 0,
          moneda: desarrollo.moneda || 'MXN',
          fecha_entrega: desarrollo.fecha_entrega || null,
          adr_base: desarrollo.adr_base || 0,
          ocupacion_anual: desarrollo.ocupacion_anual || 0,
          es_impuestos_porcentaje: desarrollo.es_impuestos_porcentaje !== undefined ? desarrollo.es_impuestos_porcentaje : false,
          impuestos: desarrollo.impuestos || 0,
          es_gastos_variables_porcentaje: desarrollo.es_gastos_variables_porcentaje !== undefined ? desarrollo.es_gastos_variables_porcentaje : false,
          gastos_variables: desarrollo.gastos_variables || 0,
          gastos_fijos: desarrollo.gastos_fijos || 0,
          es_gastos_fijos_porcentaje: desarrollo.es_gastos_fijos_porcentaje !== undefined ? desarrollo.es_gastos_fijos_porcentaje : false,
          es_mantenimiento_porcentaje: desarrollo.es_mantenimiento_porcentaje !== undefined ? desarrollo.es_mantenimiento_porcentaje : false,
          mantenimiento_valor: desarrollo.mantenimiento_valor || 0,
          imagen_url: desarrollo.imagen_url || null,
          amenidades: desarrollo.amenidades || null
        })) as Desarrollo[];
      } catch (error) {
        console.error('Error fetching desarrollos:', error);
        throw error;
      }
    },
    enabled: !!empresaId,
    ...mergedOptions
  });

  const createDesarrollo = useMutation({
    mutationFn: async (newDesarrollo: Partial<Desarrollo>) => {
      try {
        // Asegurarse de asignar la empresa del usuario autenticado
        const desarrolloWithEmpresa = {
          ...newDesarrollo,
          empresa_id: empresaId,
        };
        
        // We need to be explicit about what we're inserting
        // to ensure it matches the expected database structure
        const { data, error } = await supabase
          .from('desarrollos')
          .insert([desarrolloWithEmpresa])
          .select()
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        return data as unknown as Desarrollo;
      } catch (error) {
        console.error('Error creating desarrollo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] });
      toast({
        title: "Desarrollo creado",
        description: "El desarrollo se ha creado correctamente",
      });
      if (mergedOptions.onMutationSuccess) {
        mergedOptions.onMutationSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el desarrollo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateDesarrollo = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Desarrollo> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('desarrollos')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        return data as unknown as Desarrollo;
      } catch (error) {
        console.error('Error updating desarrollo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] });
      toast({
        title: "Desarrollo actualizado",
        description: "El desarrollo se ha actualizado correctamente",
      });
      if (mergedOptions.onMutationSuccess) {
        mergedOptions.onMutationSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el desarrollo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteDesarrollo = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('desarrollos')
          .delete()
          .eq('id', id);
          
        if (error) {
          throw new Error(error.message);
        }
        
        return id;
      } catch (error) {
        console.error('Error deleting desarrollo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] });
      toast({
        title: "Desarrollo eliminado",
        description: "El desarrollo se ha eliminado correctamente",
      });
      if (mergedOptions.onMutationSuccess) {
        mergedOptions.onMutationSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el desarrollo: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    desarrollos,
    isLoading,
    error,
    refetch,
    createDesarrollo,
    updateDesarrollo,
    deleteDesarrollo
  };
};

export default useDesarrollos;
