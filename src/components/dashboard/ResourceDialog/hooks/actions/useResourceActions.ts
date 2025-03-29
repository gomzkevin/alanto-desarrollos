
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks';
import { useResourceOperations } from './useResourceOperations';
import { useImageUpload } from './useImageUpload';
import { useClientCreation } from './useClientCreation';
import { FormValues, ResourceType } from '../../types';
import { ResourceData, ResourceOperationResult } from './types';

export const useResourceActions = (
  resourceType: ResourceType,
  resourceId?: string,
  onSuccess?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { empresaId, userId } = useUserRole();
  
  const { 
    createResource, 
    updateResource 
  } = useResourceOperations();
  
  const { handleImageUpload } = useImageUpload();
  const { createNewClient } = useClientCreation();

  // Add the deleteResource function
  const deleteResource = useCallback(async (resourceType: ResourceType, resourceId: string) => {
    try {
      const { error } = await supabase
        .from(resourceType)
        .delete()
        .eq('id', resourceId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error: any) {
      console.error(`Error deleting ${resourceType}:`, error);
      toast({
        title: 'Error',
        description: error.message || `No se pudo eliminar el ${resourceType}`,
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (values: FormValues) => {
      if (!empresaId) {
        toast({
          title: 'Error',
          description: 'No se pudo determinar la empresa',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);

      try {
        // Process image if present
        let imageUrl = values.imagen_url;
        if (values.image && values.image instanceof File) {
          imageUrl = await handleImageUpload(values.image);
        }

        // Create client if needed for leads
        if (resourceType === 'leads' && values.isNewClient) {
          await createNewClient({
            isExistingClient: false,
            newClientData: {
              nombre: values.nombre,
              email: values.email,
              telefono: values.telefono
            }
          }, empresaId);
        }

        // Prepare the data and determine if we're creating or updating
        const processedData = {
          ...values,
          imagen_url: imageUrl,
          empresa_id: empresaId,
          user_id: userId,
        };

        // Remove fields that should not be sent to the database
        delete processedData.image;
        delete processedData.isNewClient;

        let result: ResourceOperationResult | null = null;

        if (resourceId) {
          // Update existing resource
          result = await updateResource(resourceType, resourceId, processedData);
        } else {
          // Create new resource
          result = await createResource(resourceType, processedData);
        }

        if (result && result.success) {
          toast({
            title: resourceId ? 'Actualizado' : 'Creado',
            description: `${resourceType} ${resourceId ? 'actualizado' : 'creado'} exitosamente`,
          });

          if (onSuccess) {
            onSuccess();
          }
        }
      } catch (error: any) {
        console.error(`Error ${resourceId ? 'updating' : 'creating'} ${resourceType}:`, error);
        toast({
          title: 'Error',
          description: error.message || `No se pudo ${resourceId ? 'actualizar' : 'crear'} el ${resourceType}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [resourceType, resourceId, empresaId, userId, onSuccess, handleImageUpload, createNewClient, createResource, updateResource]
  );

  const handleDelete = useCallback(async () => {
    if (!resourceId) return;
    
    setIsLoading(true);
    
    try {
      await deleteResource(resourceType, resourceId);
      
      toast({
        title: 'Eliminado',
        description: `${resourceType} eliminado exitosamente`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error(`Error deleting ${resourceType}:`, error);
      toast({
        title: 'Error',
        description: error.message || `No se pudo eliminar el ${resourceType}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [resourceType, resourceId, onSuccess, deleteResource]);

  return {
    isLoading,
    handleFormSubmit,
    handleDelete,
    deleteResource,
    handleImageUpload,
  };
};
