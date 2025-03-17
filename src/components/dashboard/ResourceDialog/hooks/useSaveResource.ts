
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FormValues } from '../types';
import useResourceActions from '../useResourceActions';

export const useSaveResource = (
  resource: FormValues | null,
  resourceType: string,
  resourceId?: string,
  selectedAmenities: string[] = [],
  desarrolloId?: string,
  onSuccess?: () => void,
  onSave?: (resource: FormValues) => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Setup resource actions
  const resourceActions = useResourceActions({
    resourceType: resourceType as any,
    resourceId,
    desarrolloId,
    onSuccess,
    selectedAmenities
  });

  const saveResource = async (resourceToSave: FormValues = resource as FormValues) => {
    if (!resourceToSave) return false;
    
    setIsSubmitting(true);
    console.log('Saving resource with data:', resourceToSave);
    
    try {
      // Si hay amenidades en formato array, conviértelas a JSON
      if (resourceType === 'desarrollos' && selectedAmenities.length > 0) {
        resourceToSave.amenidades = selectedAmenities;
      }
      
      const success = await resourceActions.saveResource(resourceToSave);
      
      if (success) {
        toast({
          title: 'Éxito',
          description: `${resourceId ? 'Actualizado' : 'Creado'} correctamente`,
        });
        
        // Call the onSuccess handler if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Call the onSave handler if provided
        if (onSave) {
          onSave(resourceToSave);
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error saving resource:', error);
      
      toast({
        title: 'Error',
        description: `No se pudo ${resourceId ? 'actualizar' : 'crear'} el recurso: ${error.message}`,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    saveResource
  };
};
