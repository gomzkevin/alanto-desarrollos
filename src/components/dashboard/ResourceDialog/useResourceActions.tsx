
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from './types';
import { useToast } from '@/hooks/use-toast';

// Define a type for the tables that exist in Supabase
type SupabaseTable = 
  | 'desarrollos' 
  | 'prototipos' 
  | 'leads' 
  | 'cotizaciones'
  | 'unidades'
  | 'usuarios'
  | 'empresa_info'
  | 'desarrollo_imagenes'
  | 'propiedades'
  | 'configuracion_financiera';

// A mapping of ResourceType to actual table names
const resourceTableMap: Record<ResourceType, SupabaseTable> = {
  desarrollos: 'desarrollos',
  prototipos: 'prototipos',
  leads: 'leads',
  cotizaciones: 'cotizaciones',
  unidades: 'unidades'
};

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

export default function useResourceActions({
  resourceType,
  resourceId,
  onSuccess,
  selectedAmenities = [],
  clientConfig = {
    isExistingClient: true,
    newClientData: { nombre: '', email: '', telefono: '' }
  }
}: UseResourceActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [resourceData, setResourceData] = useState<FormValues | null>(null);
  
  const saveResource = async (formValues: FormValues): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Special handling for client data in cotizaciones
      if (resourceType === 'cotizaciones' && !clientConfig.isExistingClient && formValues) {
        // Create a new lead first
        const { nombre, email, telefono } = clientConfig.newClientData;
        
        if (!nombre) {
          toast({
            title: 'Error',
            description: 'Debe ingresar el nombre del cliente',
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }
        
        // Create new lead
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            nombre,
            email,
            telefono,
            origen: 'sistema',
            estado: 'nuevo',
            subestado: 'sin_contactar'
          })
          .select()
          .single();
          
        if (leadError) {
          console.error('Error creating lead:', leadError);
          toast({
            title: 'Error',
            description: `No se pudo crear el lead: ${leadError.message}`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }
        
        // Update form values with the new lead id
        formValues.lead_id = newLead.id;
      }
      
      // Update or create resource
      let result;

      // Get the correct table name from our mapping
      const tableName = resourceTableMap[resourceType];
      
      if (resourceId) {
        // Update existing resource
        const { data, error } = await supabase
          .from(tableName)
          .update({
            ...formValues,
            ...(resourceType === 'desarrollos' && { amenidades: selectedAmenities })
          })
          .eq('id', resourceId)
          .select();
          
        result = { data, error };
      } else {
        // Create new resource
        const { data, error } = await supabase
          .from(tableName)
          .insert({
            ...formValues,
            ...(resourceType === 'desarrollos' && { amenidades: selectedAmenities })
          })
          .select();
          
        result = { data, error };
      }
      
      if (result.error) {
        console.error('Error saving resource:', result.error);
        toast({
          title: 'Error',
          description: `No se pudo guardar: ${result.error.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      setResourceData(result.data[0]);
      
      toast({
        title: 'Éxito',
        description: `${resourceId ? 'Actualizado' : 'Creado'} correctamente`,
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error) {
      console.error('Error in saveResource:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la operación',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = async (file: File, bucket: string, folder: string, fieldName: string): Promise<string | null> => {
    if (!file) return null;
    
    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
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
      
      const publicUrl = data.publicUrl;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    resourceData,
    saveResource,
    handleImageUpload
  };
}
