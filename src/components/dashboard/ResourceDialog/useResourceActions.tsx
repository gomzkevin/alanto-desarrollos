
import useCompanySubscription from '@/hooks/useCompanySubscription';
import { toast } from '@/components/ui/use-toast';
import { ResourceType } from './types';
import { useUserRole } from '@/hooks/useUserRole';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import useOrganizationUsers from '@/hooks/useOrganizationUsers';
import { supabase } from '@/integrations/supabase/client';

interface ResourceActionsOptions {
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

export const useResourceActions = (resourceType: ResourceType) => {
  const { userId, empresaId, isAdmin } = useUserRole();
  const { subscriptionInfo } = useCompanySubscription();
  
  // Fix: Add an empty options object as required by the useDesarrollos hook
  const { desarrollos } = useDesarrollos({ onSuccess: () => {} });
  
  // Obtener información de vendedores
  const { users: vendedores } = useOrganizationUsers();
  
  // Obtener información de prototipos
  const { prototipos } = usePrototipos();
  
  const canAddResource = (resourceType: ResourceType): boolean => {
    // El usuario siempre puede crear recursos si está autenticado y tiene una empresa asignada
    return !!userId && !!empresaId;
  };
  
  const getSelectOptions = (resourceType: ResourceType) => {
    switch (resourceType) {
      case 'desarrollos':
        return [];
      case 'prototipos':
        return desarrollos.map(d => ({ label: d.nombre, value: d.id }));
      case 'leads':
        return [];
      case 'cotizaciones':
        return [
          {
            label: 'Desarrollos',
            options: desarrollos.map(d => ({ label: d.nombre, value: d.id }))
          }
        ];
      case 'unidades':
        return prototipos.map(p => ({ label: p.nombre, value: p.id }));
      default:
        return [];
    }
  };

  const saveResource = async (resource: any) => {
    try {
      if (!resource) return false;
      
      if (resourceType === 'desarrollos') {
        const { error } = await supabase
          .from('desarrollos')
          .upsert([{ ...resource, empresa_id: empresaId }]);
          
        if (error) throw error;
      } else if (resourceType === 'prototipos') {
        const { error } = await supabase
          .from('prototipos')
          .upsert([resource]);
          
        if (error) throw error;
      } else if (resourceType === 'leads') {
        const { error } = await supabase
          .from('leads')
          .upsert([{ ...resource, empresa_id: empresaId }]);
          
        if (error) throw error;
      } else if (resourceType === 'cotizaciones') {
        const { error } = await supabase
          .from('cotizaciones')
          .upsert([{ ...resource, empresa_id: empresaId }]);
          
        if (error) throw error;
      } else if (resourceType === 'unidades') {
        const { error } = await supabase
          .from('unidades')
          .upsert([resource]);
          
        if (error) throw error;
      }
      
      toast({
        title: "Éxito",
        description: "Recurso guardado correctamente"
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al guardar el recurso: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      if (!file) return null;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${resourceType}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('prototipo-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('prototipo-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al subir la imagen: ${error.message}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  return {
    canAdd: canAddResource(resourceType),
    getSelectOptions,
    saveResource,
    handleImageUpload
  };
};

export default useResourceActions;
