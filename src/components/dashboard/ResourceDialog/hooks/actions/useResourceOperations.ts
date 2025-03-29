
import { FormValues } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ResourceOperationResult } from './types';
import { ResourceType } from '../../types';

export const useResourceOperations = () => {
  const { toast } = useToast();

  const updateResource = async (
    resourceType: ResourceType,
    resourceId: string,
    data: FormValues
  ): Promise<ResourceOperationResult> => {
    try {
      const { data: result, error } = await supabase
        .from(resourceType)
        .update(data as any)
        .eq('id', resourceId)
        .select();
      
      if (error) {
        console.error(`Error updating ${resourceType}:`, error);
        return {
          success: false,
          error,
          message: `No se pudo actualizar: ${error.message}`
        };
      }
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error in updateResource (${resourceType}):`, error);
      return {
        success: false,
        error,
        message: 'Error inesperado al actualizar el recurso'
      };
    }
  };

  const createResource = async (
    resourceType: ResourceType,
    data: FormValues
  ): Promise<ResourceOperationResult> => {
    try {
      const { data: result, error } = await supabase
        .from(resourceType)
        .insert(data as any)
        .select();
      
      if (error) {
        console.error(`Error creating ${resourceType}:`, error);
        return {
          success: false,
          error,
          message: `No se pudo crear: ${error.message}`
        };
      }
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error(`Error in createResource (${resourceType}):`, error);
      return {
        success: false,
        error,
        message: 'Error inesperado al crear el recurso'
      };
    }
  };

  return {
    updateResource,
    createResource
  };
};

export default useResourceOperations;
