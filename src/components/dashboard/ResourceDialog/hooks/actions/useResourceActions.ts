
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FormValues } from '../../types';
import { UseResourceActionsProps } from './types';
import { useUserRole } from '@/hooks';
import useClientCreation from './useClientCreation';
import useImageUpload from './useImageUpload';
import useResourceOperations from './useResourceOperations';

const useResourceActions = ({
  resourceType,
  resourceId,
  onSuccess,
  selectedAmenities = [],
  clientConfig = { isExistingClient: true, newClientData: { nombre: '', email: '', telefono: '' } }
}: UseResourceActionsProps) => {
  const { toast } = useToast();
  const { empresaId } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { handleImageUpload, isUploading } = useImageUpload();
  const { createNewClient } = useClientCreation();
  const { updateResource, createResource } = useResourceOperations();

  const saveResource = async (resource: FormValues): Promise<boolean> => {
    console.log('Guardando recurso:', resource);
    console.log('Client config:', clientConfig);
    
    if (!resource) {
      console.error('No se proporcionaron datos del recurso');
      return false;
    }

    setIsSubmitting(true);
    
    try {
      let dataToSave = { ...resource };

      // Procesamiento específico por tipo de recurso
      if (resourceType === 'desarrollos') {
        if (selectedAmenities && selectedAmenities.length > 0) {
          dataToSave.amenidades = selectedAmenities;
        }
        
        if (!dataToSave.empresa_id && empresaId) {
          dataToSave.empresa_id = empresaId;
        }
      } else if (resourceType === 'leads') {
        if (!dataToSave.empresa_id && empresaId) {
          dataToSave.empresa_id = empresaId;
        }
      }

      // Crear nuevo cliente si es necesario para cotizaciones
      let newClientId = null;
      if (resourceType === ('cotizaciones' as ResourceType) && !clientConfig.isExistingClient && !resourceId) {
        const clientResult = await createNewClient(clientConfig, empresaId);
        
        if (!clientResult.success) {
          setIsSubmitting(false);
          return false;
        }
        
        if (clientResult.clientId) {
          dataToSave.lead_id = clientResult.clientId;
          newClientId = clientResult.clientId;
        }
      }

      // Ejecutar la operación de guardado apropiada
      let result;
      let success = false;
      
      if (resourceId) {
        // Actualizar recurso existente
        const updateResult = await updateResource(resourceType, resourceId, dataToSave);
        success = updateResult.success;
        result = updateResult.data;
        
        if (!success) {
          toast({
            title: 'Error',
            description: updateResult.message || 'Error al actualizar',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Actualizado',
            description: `${resourceType} actualizado correctamente`,
          });
        }
      } else {
        // Crear nuevo recurso
        const createResult = await createResource(resourceType, dataToSave);
        success = createResult.success;
        result = createResult.data;
        
        if (!success) {
          toast({
            title: 'Error',
            description: createResult.message || 'Error al crear',
            variant: 'destructive',
          });
        } else if (resourceType === ('cotizaciones' as ResourceType)) {
          const successMessage = newClientId 
            ? 'Cotización creada y nuevo cliente agregado a prospectos' 
            : 'Cotización creada correctamente';
            
          toast({
            title: 'Creado',
            description: successMessage,
          });
        } else {
          toast({
            title: 'Creado',
            description: `${resourceType} creado correctamente`,
          });
        }
      }
      
      console.log(`${resourceType} guardado:`, result);
      
      if (success && onSuccess) {
        onSuccess();
      }
      
      return success;
    } catch (error) {
      console.error(`Error guardando ${resourceType}:`, error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    saveResource,
    handleImageUpload,
    isSubmitting,
    isUploading
  };
};

export default useResourceActions;
