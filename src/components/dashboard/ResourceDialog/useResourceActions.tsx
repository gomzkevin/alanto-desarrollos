import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ResourceType, FormValues } from './types';
import useUserRole from '@/hooks/useUserRole';

interface UseResourceActionsProps {
  resourceType: ResourceType;
  resourceId?: string;
  onSuccess?: () => void;
  selectedAmenities?: string[];
  clientConfig?: {
    isExistingClient: boolean;
    newClientData: {
      nombre: string;
      email: string;
      telefono: string;
    };
  };
}

const useResourceActions = ({
  resourceType,
  resourceId,
  onSuccess,
  selectedAmenities = [],
  clientConfig = { isExistingClient: true, newClientData: { nombre: '', email: '', telefono: '' } }
}: UseResourceActionsProps) => {
  const { toast } = useToast();
  const { empresaId } = useUserRole();
  const [isUploading, setIsUploading] = useState(false);

  const saveResource = async (resource: FormValues): Promise<boolean> => {
    console.log('Saving resource:', resource);
    
    if (!resource) {
      console.error('No resource data provided');
      return false;
    }

    try {
      // Prepare the data to be saved
      let dataToSave = { ...resource };

      // Special handling per resource type
      if (resourceType === 'desarrollos') {
        // Handle amenidades for desarrollos
        if (selectedAmenities && selectedAmenities.length > 0) {
          dataToSave.amenidades = selectedAmenities;
        }
        
        // Ensure empresa_id is set
        if (!dataToSave.empresa_id && empresaId) {
          dataToSave.empresa_id = empresaId;
        }
      } else if (resourceType === 'leads') {
        // For leads, ensure empresa_id is set
        if (!dataToSave.empresa_id && empresaId) {
          dataToSave.empresa_id = empresaId;
        }
        
        // The rest of lead handling remains the same
        // No need to modify agente handling as it's now a UUID
      }

      // Handle client creation for cotizaciones if needed
      if (resourceType === 'cotizaciones' && !clientConfig.isExistingClient && !resourceId) {
        const { nombre, email, telefono } = clientConfig.newClientData;
        
        if (nombre) {
          // Create a new client first
          const { data: newClient, error: clientError } = await supabase
            .from('leads')
            .insert({
              nombre,
              email,
              telefono,
              estado: 'seguimiento',
              subestado: 'cotizacion_enviada',
              empresa_id: empresaId
            })
            .select()
            .single();
          
          if (clientError) {
            console.error('Error creating new client:', clientError);
            toast({
              title: 'Error',
              description: `No se pudo crear el cliente: ${clientError.message}`,
              variant: 'destructive',
            });
            return false;
          }
          
          // Use the new client ID
          if (newClient) {
            dataToSave.lead_id = newClient.id;
          }
        } else {
          toast({
            title: 'Error',
            description: 'Se requiere un nombre para crear un nuevo cliente',
            variant: 'destructive',
          });
          return false;
        }
      }

      // Save the resource
      let result;
      
      if (resourceId) {
        // Update existing resource
        const { data, error } = await supabase
          .from(resourceType)
          .update(dataToSave)
          .eq('id', resourceId)
          .select();
        
        if (error) {
          console.error(`Error updating ${resourceType}:`, error);
          toast({
            title: 'Error',
            description: `No se pudo actualizar: ${error.message}`,
            variant: 'destructive',
          });
          return false;
        }
        
        result = data;
        toast({
          title: 'Actualizado',
          description: `${resourceType} actualizado correctamente`,
        });
      } else {
        // Create new resource
        const { data, error } = await supabase
          .from(resourceType)
          .insert(dataToSave)
          .select();
        
        if (error) {
          console.error(`Error creating ${resourceType}:`, error);
          toast({
            title: 'Error',
            description: `No se pudo crear: ${error.message}`,
            variant: 'destructive',
          });
          return false;
        }
        
        result = data;
        toast({
          title: 'Creado',
          description: `${resourceType} creado correctamente`,
        });
      }
      
      console.log(`${resourceType} saved:`, result);
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving ${resourceType}:`, error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${resourceType}_${Date.now()}.${fileExt}`;
      const filePath = `${resourceType}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('prototipo-images')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: 'Error',
          description: `No se pudo subir la imagen: ${uploadError.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      const { data } = supabase.storage
        .from('prototipo-images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al subir la imagen',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    saveResource,
    handleImageUpload,
  };
};

export default useResourceActions;
