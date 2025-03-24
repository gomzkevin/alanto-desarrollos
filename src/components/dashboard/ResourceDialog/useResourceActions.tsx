
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import useLeads from '@/hooks/useLeads';
import { useDesarrollos } from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import useUnidades from '@/hooks/useUnidades';
import { useUserRole } from '@/hooks/useUserRole';

type ResourceKey = 'leads' | 'desarrollos' | 'prototipos' | 'unidades';

export const useResourceActions = (resource: ResourceKey) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { empresaId } = useUserRole();
  
  // Get the appropriate hook functions based on resource type
  const getLeadsFunctions = () => {
    const { createLead, updateLead, deleteLead } = useLeads({ empresa_id: empresaId });
    return { 
      create: createLead, 
      update: updateLead, 
      delete: deleteLead 
    };
  };
  
  const getDesarrollosFunctions = () => {
    const { createDesarrollo, updateDesarrollo, deleteDesarrollo } = useDesarrollos({ empresa_id: empresaId });
    return { 
      create: createDesarrollo, 
      update: updateDesarrollo, 
      delete: deleteDesarrollo 
    };
  };
  
  const getPrototiposFunctions = () => {
    return { 
      create: async (data: any) => {
        console.log('Creating prototipo with data:', data);
        // Implementation placeholder
      }, 
      update: async (id: string, data: any) => {
        console.log('Updating prototipo with id:', id, 'and data:', data);
        // Implementation placeholder
      }, 
      delete: async (id: string) => {
        console.log('Deleting prototipo with id:', id);
        // Implementation placeholder
      } 
    };
  };
  
  const getUnidadesFunctions = () => {
    const { createUnidad, updateUnidad, deleteUnidad } = useUnidades();
    return { 
      create: createUnidad, 
      update: updateUnidad, 
      delete: deleteUnidad 
    };
  };
  
  // Get the appropriate functions based on resource type
  const getActions = () => {
    switch (resource) {
      case 'leads':
        return getLeadsFunctions();
      case 'desarrollos':
        return getDesarrollosFunctions();
      case 'prototipos':
        return getPrototiposFunctions();
      case 'unidades':
        return getUnidadesFunctions();
      default:
        throw new Error(`Resource type ${resource} is not supported`);
    }
  };
  
  const actions = getActions();
  
  // Generic function to create a resource
  const handleCreate = async (data: any) => {
    try {
      await actions.create(data);
      toast({
        title: `${resource.slice(0, -1)} creado`,
        description: `El ${resource.slice(0, -1)} ha sido creado exitosamente`
      });
    } catch (error: any) {
      console.error(`Error al crear ${resource.slice(0, -1)}:`, error);
      toast({
        title: "Error",
        description: `No se pudo crear el ${resource.slice(0, -1)}: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Generic function to update a resource
  const handleUpdate = async (id: string, data: any) => {
    try {
      await actions.update(id, data);
      toast({
        title: `${resource.slice(0, -1)} actualizado`,
        description: `El ${resource.slice(0, -1)} ha sido actualizado exitosamente`
      });
    } catch (error: any) {
      console.error(`Error al actualizar ${resource.slice(0, -1)}:`, error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el ${resource.slice(0, -1)}: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Generic function to delete a resource
  const handleDelete = async (id: string) => {
    try {
      await actions.delete(id);
      toast({
        title: `${resource.slice(0, -1)} eliminado`,
        description: `El ${resource.slice(0, -1)} ha sido eliminado exitosamente`
      });
    } catch (error: any) {
      console.error(`Error al eliminar ${resource.slice(0, -1)}:`, error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el ${resource.slice(0, -1)}: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  // Generic function to redirect to the resource page
  const handleView = (id: string) => {
    navigate(`/dashboard/${resource}/${id}`);
  };
  
  return {
    create: handleCreate,
    update: handleUpdate,
    delete: handleDelete,
    view: handleView
  };
};
