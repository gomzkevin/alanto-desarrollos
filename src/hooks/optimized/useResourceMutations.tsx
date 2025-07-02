import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { toast } from '@/components/ui/use-toast';

export const useResourceMutations = () => {
  const queryClient = useQueryClient();
  const { empresaId } = useCompanyContext();
  
  // Generic mutation factory
  const createMutation = (
    tableName: 'desarrollos' | 'prototipos' | 'leads' | 'usuarios',
    operation: 'create' | 'update' | 'delete',
    successMessage: string,
    queryKeys: string[] = []
  ) => {
    return useMutation({
      mutationFn: async (data: any) => {
        let result;
        
        switch (operation) {
          case 'create':
            result = await supabase.from(tableName).insert(data).select().single();
            break;
          case 'update':
            result = await supabase.from(tableName).update(data).eq('id', data.id).select().single();
            break;
          case 'delete':
            result = await supabase.from(tableName).delete().eq('id', data.id);
            break;
        }
        
        if (result.error) throw result.error;
        return result.data;
      },
      onSuccess: () => {
        toast({
          title: 'Éxito',
          description: successMessage,
        });
        
        // Invalidate relevant queries
        const defaultKeys = [tableName, 'dashboardMetrics', 'companyData'];
        const allKeys = [...defaultKeys, ...queryKeys];
        
        allKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: [key, empresaId] });
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.message || 'Ocurrió un error inesperado',
          variant: 'destructive',
        });
      }
    });
  };
  
  // Specific mutations
  const createDesarrollo = createMutation(
    'desarrollos', 
    'create', 
    'Desarrollo creado exitosamente',
    ['prototipos', 'unidades']
  );
  
  const updateDesarrollo = createMutation(
    'desarrollos', 
    'update', 
    'Desarrollo actualizado exitosamente',
    ['prototipos', 'unidades']
  );
  
  const deleteDesarrollo = createMutation(
    'desarrollos', 
    'delete', 
    'Desarrollo eliminado exitosamente',
    ['prototipos', 'unidades', 'cotizaciones']
  );
  
  const createPrototipo = createMutation(
    'prototipos', 
    'create', 
    'Prototipo creado exitosamente',
    ['unidades', 'cotizaciones']
  );
  
  const updatePrototipo = createMutation(
    'prototipos', 
    'update', 
    'Prototipo actualizado exitosamente',
    ['unidades', 'cotizaciones']
  );
  
  const deletePrototipo = createMutation(
    'prototipos', 
    'delete', 
    'Prototipo eliminado exitosamente',
    ['unidades', 'cotizaciones']
  );
  
  const createLead = createMutation(
    'leads', 
    'create', 
    'Lead creado exitosamente',
    ['cotizaciones']
  );
  
  const updateLead = createMutation(
    'leads', 
    'update', 
    'Lead actualizado exitosamente',
    ['cotizaciones']
  );
  
  const deleteLead = createMutation(
    'leads', 
    'delete', 
    'Lead eliminado exitosamente',
    ['cotizaciones']
  );
  
  return {
    // Desarrollos
    createDesarrollo,
    updateDesarrollo,
    deleteDesarrollo,
    
    // Prototipos
    createPrototipo,
    updatePrototipo,
    deletePrototipo,
    
    // Leads
    createLead,
    updateLead,
    deleteLead,
    
    // Utility functions
    invalidateResource: (resourceType: string) => {
      queryClient.invalidateQueries({ queryKey: [resourceType, empresaId] });
    },
    
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics', empresaId] });
      queryClient.invalidateQueries({ queryKey: ['companyData', empresaId] });
    }
  };
};