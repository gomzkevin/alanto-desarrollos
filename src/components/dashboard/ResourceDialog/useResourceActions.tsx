
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from './types';
import { getCurrentUserId } from '@/lib/supabase';
import useUserRole from '@/hooks/useUserRole';

interface UseResourceActionsProps {
  resourceType: ResourceType;
  resourceId?: string;
  onSuccess?: () => void;
  selectedAmenities?: string[];
  clientConfig?: {
    isExistingClient: boolean;
    newClientData: { nombre: string; email: string; telefono: string };
  };
}

export default function useResourceActions({
  resourceType,
  resourceId,
  onSuccess,
  selectedAmenities = [],
  clientConfig
}: UseResourceActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { empresaId } = useUserRole();

  // Save resource function
  const saveResource = async (values: FormValues) => {
    setIsLoading(true);
    console.log('Starting saveResource with:', values);

    try {
      console.log('Saving resource:', resourceType, values);
      
      // Prepare the data to be saved
      let data = { ...values };
      
      // Handle special cases for each resource type
      if (resourceType === 'desarrollos' && selectedAmenities.length > 0) {
        data.amenidades = selectedAmenities;
      }
      
      // If creating a new desarrollo, ensure it has a user_id
      if (resourceType === 'desarrollos' && !resourceId && !data.user_id) {
        const userId = await getCurrentUserId();
        
        if (userId) {
          data.user_id = userId;
        } else {
          toast({
            title: 'Error',
            description: 'No se pudo obtener el ID de usuario. Por favor, inicia sesión nuevamente.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }
      }
      
      // Ensure empresa_id is set for new resources
      if ((resourceType === 'leads' || resourceType === 'cotizaciones') && empresaId) {
        data.empresa_id = empresaId;
      }
      
      // Handle client creation for cotizaciones
      if (resourceType === 'cotizaciones' && !clientConfig?.isExistingClient) {
        // Create a new lead first
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            nombre: clientConfig?.newClientData.nombre,
            email: clientConfig?.newClientData.email,
            telefono: clientConfig?.newClientData.telefono,
            estado: 'nuevo',
            subestado: 'sin_contactar',
            empresa_id: empresaId
          })
          .select()
          .single();
        
        if (leadError) {
          console.error('Error creating new lead:', leadError);
          toast({
            title: 'Error',
            description: `No se pudo crear el nuevo cliente: ${leadError.message}`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }
        
        // Update the cotizacion with the new lead_id
        data.lead_id = newLead.id;
      }
      
      // Handle update or insert based on resourceId
      if (resourceId) {
        // Update existing resource
        console.log('Updating existing resource with id:', resourceId);
        const { error } = await supabase
          .from(resourceType)
          .update(data as any)
          .eq('id', resourceId);
        
        if (error) {
          console.error(`Error updating ${resourceType}:`, error);
          toast({
            title: 'Error',
            description: `No se pudo actualizar: ${error.message}`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }
        
        console.log(`Successfully updated ${resourceType} with id ${resourceId}`);
        toast({
          title: 'Actualizado',
          description: `${getResourceLabel(resourceType)} actualizado correctamente`,
        });
      } else {
        // Create new resource
        console.log('Creating new resource');
        const { error } = await supabase
          .from(resourceType)
          .insert(data as any);
        
        if (error) {
          console.error(`Error creating ${resourceType}:`, error);
          toast({
            title: 'Error',
            description: `No se pudo crear: ${error.message}`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }
        
        console.log(`Successfully created new ${resourceType}`);
        toast({
          title: 'Creado',
          description: `${getResourceLabel(resourceType)} creado correctamente`,
        });
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        console.log('Calling onSuccess callback');
        onSuccess();
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error in saveResource:', error);
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error inesperado',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  };
  
  // Function to handle image uploads
  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      let filePath = '';
      
      if (resourceType === 'desarrollos') {
        filePath = `desarrollos/${fileName}`;
      } else if (resourceType === 'prototipos') {
        filePath = `prototipos/${fileName}`;
      } else {
        filePath = `otros/${fileName}`;
      }
      
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
        description: 'No se pudo subir la imagen',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  // Helper function to get user-friendly resource type label
  const getResourceLabel = (type: ResourceType): string => {
    switch (type) {
      case 'desarrollos':
        return 'Desarrollo';
      case 'prototipos':
        return 'Prototipo';
      case 'leads':
        return 'Lead';
      case 'cotizaciones':
        return 'Cotización';
      case 'unidades':
        return 'Unidad';
      default:
        return 'Recurso';
    }
  };

  return {
    isLoading,
    saveResource,
    handleImageUpload
  };
}
