
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from './types';
import { useToast } from '@/hooks/use-toast';

interface ClientConfig {
  isExistingClient: boolean;
  newClientData: {
    nombre: string;
    email: string;
    telefono: string;
  };
}

interface UseResourceActionsProps {
  resourceType: ResourceType;
  resourceId?: string;
  onSuccess?: () => void;
  selectedAmenities?: string[];
  clientConfig?: ClientConfig;
}

const useResourceActions = ({
  resourceType,
  resourceId,
  onSuccess,
  selectedAmenities = [],
  clientConfig = {
    isExistingClient: true,
    newClientData: { nombre: '', email: '', telefono: '' }
  }
}: UseResourceActionsProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Handle image upload
  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${resourceType}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const bucket = resourceType === 'desarrollos' ? 'desarrollo-images' : 'prototipo-images';
      const folder = resourceType === 'desarrollos' ? 'desarrollos' : 'prototipos';
      const filePath = `${folder}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Save resource
  const saveResource = async (values: FormValues): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      let query;
      
      // Handle amenities for desarrollos
      if (resourceType === 'desarrollos' && selectedAmenities.length > 0) {
        values.amenidades = selectedAmenities;
      }
      
      // Create new lead if needed for cotizaciones
      if (resourceType === 'cotizaciones' && !resourceId && !clientConfig.isExistingClient && !values.lead_id) {
        if (!clientConfig.newClientData.nombre) {
          toast({
            title: 'Error',
            description: 'El nombre del cliente es requerido',
            variant: 'destructive',
          });
          return false;
        }
        
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            nombre: clientConfig.newClientData.nombre,
            email: clientConfig.newClientData.email,
            telefono: clientConfig.newClientData.telefono,
            estado: 'nuevo',
            subestado: 'sin_contactar'
          })
          .select('id')
          .single();
        
        if (leadError) {
          throw leadError;
        }
        
        values.lead_id = newLead.id;
      }
      
      if (resourceId) {
        // Update existing
        query = supabase
          .from(resourceType)
          .update(values)
          .eq('id', resourceId);
      } else {
        // Create new
        query = supabase
          .from(resourceType)
          .insert(values);
      }
      
      const { error } = await query;
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Éxito',
        description: `${resourceId ? 'Actualizado' : 'Creado'} correctamente`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveResource:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el recurso',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    saveResource,
    handleImageUpload, // Necesario asegurarse de exportar esto
    isSubmitting,
    uploading
  };
};

export default useResourceActions;
