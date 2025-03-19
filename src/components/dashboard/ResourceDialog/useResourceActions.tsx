import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { Tables } from '@/integrations/supabase/types';

type ResourceType = 'desarrollo' | 'prototipo' | 'propiedad' | 'lead' | 'cotizacion';
type ResourceFormData =
  | Tables<'public', 'desarrollos'>['Insert']
  | Tables<'public', 'prototipos'>['Insert']
  | Tables<'public', 'propiedades'>['Insert']
  | Tables<'public', 'leads'>['Insert']
  | Tables<'public', 'cotizaciones'>['Insert'];

interface UseResourceActionsProps {
  resourceType: ResourceType;
  onSuccess?: (resource: any) => void;
  onError?: (error: Error) => void;
}

const getTableName = (resourceType: ResourceType): string => {
  switch (resourceType) {
    case 'desarrollo':
      return 'desarrollos';
    case 'prototipo':
      return 'prototipos';
    case 'propiedad':
      return 'propiedades';
    case 'lead':
      return 'leads';
    case 'cotizacion':
      return 'cotizaciones';
    default:
      throw new Error(`Invalid resource type: ${resourceType}`);
  }
};

export const useResourceActions = ({
  resourceType,
  onSuccess,
  onError,
}: UseResourceActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resourceData, setResourceData] = useState<ResourceFormData | null>(null);
  const { toast } = useToast();
  const user = useUserRole();

  const handleCreate = async (data: ResourceFormData) => {
    setIsLoading(true);
    
    try {
      console.log(`Creating ${resourceType}:`, data);
      
      // Convert data to any to avoid TypeScript errors with potential mismatches
      // between the form data and the database schema
      const dbData = data as any;
      
      // Special handling for desarrollo creation - set defaults
      if (resourceType === 'desarrollo') {
        if (!dbData.total_unidades) dbData.total_unidades = 0;
        if (!dbData.unidades_disponibles) dbData.unidades_disponibles = 0;
      }
      
      let result;
      
      // Add the company ID if the user has one and it's a top-level resource
      if (['desarrollo', 'lead'].includes(resourceType)) {
        const { data: hasColumn } = await supabase
          .rpc('has_column', { 
            table_name: resourceType === 'desarrollo' ? 'desarrollos' : 'leads', 
            column_name: 'empresa_id' 
          });
          
        if (hasColumn && user.userData?.empresaId) {
          dbData.empresa_id = user.userData.empresaId;
        }
      }
      
      const { data: createdResource, error } = await supabase
        .from(getTableName(resourceType))
        .insert(dbData)
        .select();
        
      if (error) throw error;
      
      result = createdResource[0];
      
      if (resourceType === 'desarrollo' && dbData.imagen_url) {
        const imageUrl = dbData.imagen_url as string;
        const imageName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        
        const { error: imageError } = await supabase
          .from('desarrollo_imagenes')
          .insert({
            desarrollo_id: result.id,
            url: imageUrl,
            es_principal: true,
            orden: 1,
          });
          
        if (imageError) {
          console.error('Error uploading image:', imageError);
          toast({
            title: 'Error',
            description: 'Error al subir la imagen',
            variant: 'destructive',
          });
        }
      }
      
      setIsLoading(false);
      setResourceData(result);
      
      toast({
        title: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} creado`,
        description: `El ${resourceType} ha sido creado exitosamente`,
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error(`Error creating ${resourceType}:`, error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: `No se pudo crear el ${resourceType}: ${error.message}`,
        variant: 'destructive',
      });
      if (onError) {
        onError(error);
      }
    }
  };

  const handleUpdate = async (id: string, data: ResourceFormData) => {
    setIsLoading(true);

    try {
      console.log(`Updating ${resourceType} with ID ${id}:`, data);

      // Convert data to any to avoid TypeScript errors
      const dbData = data as any;

      const { data: updatedResource, error } = await supabase
        .from(getTableName(resourceType))
        .update(dbData)
        .eq('id', id)
        .select();

      if (error) throw error;

      setIsLoading(false);
      setResourceData(updatedResource[0]);

      toast({
        title: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} actualizado`,
        description: `El ${resourceType} ha sido actualizado exitosamente`,
      });

      if (onSuccess) {
        onSuccess(updatedResource[0]);
      }
    } catch (error: any) {
      console.error(`Error updating ${resourceType}:`, error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: `No se pudo actualizar el ${resourceType}: ${error.message}`,
        variant: 'destructive',
      });
      if (onError) {
        onError(error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);

    try {
      console.log(`Deleting ${resourceType} with ID ${id}`);

      const { error } = await supabase
        .from(getTableName(resourceType))
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIsLoading(false);
      setResourceData(null);

      toast({
        title: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} eliminado`,
        description: `El ${resourceType} ha sido eliminado exitosamente`,
      });

      if (onSuccess) {
        onSuccess(null);
      }
    } catch (error: any) {
      console.error(`Error deleting ${resourceType}:`, error);
      setIsLoading(false);
      toast({
        title: 'Error',
        description: `No se pudo eliminar el ${resourceType}: ${error.message}`,
        variant: 'destructive',
      });
      if (onError) {
        onError(error);
      }
    }
  };

  return {
    isLoading,
    resourceData,
    createResource: handleCreate,
    updateResource: handleUpdate,
    deleteResource: handleDelete,
  };
};
