import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface Desarrollo {
  id: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  latitud: number | null;
  longitud: number | null;
  estado: string;
  fecha_inicio: string | null;
  fecha_finalizacion_estimada: string | null;
  empresa_id: number;
  created_at: string;
  updated_at: string;
  cover_image?: string;
  logo?: string;
  amenidades?: string[];
  // Additional fields from the database
  user_id?: string;
  total_unidades?: number | null;
  unidades_disponibles?: number | null;
  avance_porcentaje?: number | null;
  comision_operador?: number | null;
  moneda?: string | null;
  fecha_entrega?: string | null;
  adr_base?: number | null;
  ocupacion_anual?: number | null;
  es_impuestos_porcentaje?: boolean | null;
  impuestos?: number | null;
  es_gastos_variables_porcentaje?: boolean | null;
  gastos_variables?: number | null;
  gastos_fijos?: number | null;
  es_gastos_fijos_porcentaje?: boolean | null;
  es_mantenimiento_porcentaje?: boolean | null;
  mantenimiento_valor?: number | null;
  imagen_url?: string | null;
}

export interface UseDesarrollosOptions {
  onSuccess?: (data: Desarrollo[]) => void;
  onMutationSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDesarrollos = (options: UseDesarrollosOptions = {}) => {
  const { userId, empresaId } = useUserRole();
  const queryClient = useQueryClient();

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
          
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Fix for type mismatches - ensure we cast properly
        return data as unknown as Desarrollo[];
      } catch (error) {
        console.error('Error fetching desarrollos:', error);
        throw error;
      }
    },
    enabled: !!empresaId
  });

  const createDesarrollo = useMutation({
    mutationFn: async (newDesarrollo: Partial<Desarrollo>) => {
      try {
        // Asegurarse de asignar la empresa del usuario autenticado
        const desarrolloWithEmpresa = {
          ...newDesarrollo,
          empresa_id: empresaId,
        };
        
        // Fix type mismatch by being explicit about the fields we're passing
        const { data, error } = await supabase
          .from('desarrollos')
          .insert([{
            nombre: desarrolloWithEmpresa.nombre,
            ubicacion: desarrolloWithEmpresa.ubicacion,
            descripcion: desarrolloWithEmpresa.descripcion,
            empresa_id: desarrolloWithEmpresa.empresa_id,
            total_unidades: desarrolloWithEmpresa.total_unidades,
            unidades_disponibles: desarrolloWithEmpresa.unidades_disponibles,
            amenidades: desarrolloWithEmpresa.amenidades,
            imagen_url: desarrolloWithEmpresa.imagen_url,
            // Other optional fields
            latitud: desarrolloWithEmpresa.latitud,
            longitud: desarrolloWithEmpresa.longitud,
            estado: desarrolloWithEmpresa.estado,
            fecha_inicio: desarrolloWithEmpresa.fecha_inicio,
            fecha_finalizacion_estimada: desarrolloWithEmpresa.fecha_finalizacion_estimada,
            avance_porcentaje: desarrolloWithEmpresa.avance_porcentaje,
            comision_operador: desarrolloWithEmpresa.comision_operador,
            moneda: desarrolloWithEmpresa.moneda,
            fecha_entrega: desarrolloWithEmpresa.fecha_entrega,
            adr_base: desarrolloWithEmpresa.adr_base,
            ocupacion_anual: desarrolloWithEmpresa.ocupacion_anual,
            es_impuestos_porcentaje: desarrolloWithEmpresa.es_impuestos_porcentaje,
            impuestos: desarrolloWithEmpresa.impuestos,
            es_gastos_variables_porcentaje: desarrolloWithEmpresa.es_gastos_variables_porcentaje,
            gastos_variables: desarrolloWithEmpresa.gastos_variables,
            gastos_fijos: desarrolloWithEmpresa.gastos_fijos,
            es_gastos_fijos_porcentaje: desarrolloWithEmpresa.es_gastos_fijos_porcentaje,
            es_mantenimiento_porcentaje: desarrolloWithEmpresa.es_mantenimiento_porcentaje,
            mantenimiento_valor: desarrolloWithEmpresa.mantenimiento_valor
          }])
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
      if (options.onMutationSuccess) {
        options.onMutationSuccess();
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
      if (options.onMutationSuccess) {
        options.onMutationSuccess();
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
      if (options.onMutationSuccess) {
        options.onMutationSuccess();
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
