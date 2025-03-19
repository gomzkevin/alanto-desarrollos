
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from './types';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

// Define valid table names from the Supabase schema
type ValidTableName = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones' | 'unidades';

// A mapping of ResourceType to actual table names
const resourceTableMap: Record<ResourceType, ValidTableName> = {
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
        // For desarrollos, we need to handle the amenidades field specially
        if (resourceType === 'desarrollos') {
          // Create a full resource object with all required fields
          const updateData = {
            ...formValues,
            amenidades: selectedAmenities,
          };
          
          // Update existing resource
          const { data, error } = await supabase
            .from(tableName)
            .update(updateData as any) // Using type assertion for now
            .eq('id', resourceId)
            .select();
            
          result = { data, error };
        } else {
          // Update existing resource for other resource types
          const { data, error } = await supabase
            .from(tableName)
            .update(formValues as any) // Using type assertion for now
            .eq('id', resourceId)
            .select();
            
          result = { data, error };
        }
      } else {
        // Insert new resource
        if (resourceType === 'desarrollos') {
          // Create a full resource object with all required fields
          const insertData = {
            ...formValues,
            amenidades: selectedAmenities,
          };
          
          // Insert new resource
          const { data, error } = await supabase
            .from(tableName)
            .insert(insertData as any) // Using type assertion for now
            .select();
            
          result = { data, error };
        } else {
          // Insert new resource for other resource types
          const { data, error } = await supabase
            .from(tableName)
            .insert(formValues as any) // Using type assertion for now
            .select();
            
          result = { data, error };
        }
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
