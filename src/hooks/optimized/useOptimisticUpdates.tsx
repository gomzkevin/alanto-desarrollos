import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';
import { toast } from '@/components/ui/use-toast';

interface OptimisticUpdateOptions {
  resourceType: 'desarrollos' | 'prototipos' | 'leads' | 'usuarios' | 'ventas' | 'unidades';
  operation: 'create' | 'update' | 'delete';
  queryKey: string[];
}

export const useOptimisticUpdates = (options: OptimisticUpdateOptions) => {
  const queryClient = useQueryClient();
  const { empresaId } = useCompanyContext();
  const { resourceType, operation, queryKey } = options;
  
  return useMutation({
    mutationFn: async (data: any) => {
      let result;
      
      switch (operation) {
        case 'create':
          result = await supabase.from(resourceType).insert(data).select().single();
          break;
        case 'update':
          result = await supabase.from(resourceType).update(data).eq('id', data.id).select().single();
          break;
        case 'delete':
          result = await supabase.from(resourceType).delete().eq('id', data.id);
          break;
      }
      
      if (result.error) throw result.error;
      return result.data;
    },
    
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any[]) => {
        if (!old) return [newData];
        
        switch (operation) {
          case 'create':
            return [{ ...newData, id: 'temp-' + Date.now() }, ...old];
          case 'update':
            return old.map(item => 
              item.id === newData.id ? { ...item, ...newData } : item
            );
          case 'delete':
            return old.filter(item => item.id !== newData.id);
          default:
            return old;
        }
      });
      
      return { previousData };
    },
    
    // If the mutation fails, rollback
    onError: (err, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      toast({
        title: 'Error',
        description: err.message || 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate dashboard metrics
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics', empresaId] });
    },
    
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: `${resourceType} ${operation === 'create' ? 'creado' : operation === 'update' ? 'actualizado' : 'eliminado'} exitosamente`,
      });
    }
  });
};