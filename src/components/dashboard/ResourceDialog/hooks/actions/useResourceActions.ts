
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks';
import { useResourceOperations } from './useResourceOperations';
import { useImageUpload } from './useImageUpload';
import { useClientCreation } from './useClientCreation';
import { ResourceData, ResourceFormValues } from '../../types';

export const useResourceActions = (
  resourceType: string,
  resourceId?: string,
  onSuccess?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { empresaId, userId } = useUserRole();
  
  const { 
    createResource, 
    updateResource, 
    deleteResource 
  } = useResourceOperations();
  
  const { uploadImage } = useImageUpload();
  const { createClientIfNeeded } = useClientCreation();

  const handleFormSubmit = useCallback(
    async (values: ResourceFormValues) => {
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
          imageUrl = await uploadImage(values.image, resourceType, resourceId);
        }

        // Create client if needed for leads
        if (resourceType === 'leads' && values.isNewClient) {
          await createClientIfNeeded(values);
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

        let result: ResourceData | null = null;

        if (resourceId) {
          // Update existing resource
          result = await updateResource(resourceType, resourceId, processedData);
        } else {
          // Create new resource
          result = await createResource(resourceType, processedData);
        }

        if (result) {
          toast({
            title: resourceId ? 'Actualizado' : 'Creado',
            description: `${resourceType} ${resourceId ? 'actualizado' : 'creado'} exitosamente`,
            variant: 'success',
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
    [resourceType, resourceId, empresaId, userId, onSuccess, uploadImage, createClientIfNeeded, createResource, updateResource]
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
  };
};
