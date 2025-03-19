
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from './types';
import { useUserRole } from '@/hooks/useUserRole';

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
  const { userData } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);

  // Save resource function
  const saveResource = async (values: FormValues) => {
    setIsLoading(true);
    console.log('Starting saveResource with:', values);

    try {
      console.log('Saving resource:', resourceType, values);
      
      // Prepare the data to be saved
      let data = { ...values };
      
      // Add empresa_id to all resources if it doesn't exist
      if (userData?.empresaId && !data.empresa_id) {
        data.empresa_id = userData.empresaId;
      }
      
      // Handle special cases for each resource type
      if (resourceType === 'desarrollos' && selectedAmenities.length > 0) {
        data.amenidades = selectedAmenities;
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
            empresa_id: userData?.empresaId // Associate the lead with the user's company
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
        
        // For TypeScript type safety, convert the data to any before update
        // This avoids TypeScript errors with missing required fields that may not be needed in updates
        const updateData: any = data;
        
        const { error } = await supabase
          .from(resourceType)
          .update(updateData)
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
        console.log('Creating new resource', data);
        
        // For TypeScript type safety, convert the data to any before insert
        // This ensures that all required fields are present during runtime validation
        const insertData: any = data;
        
        const { error } = await supabase
          .from(resourceType)
          .insert(insertData);
        
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
