
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import useLeads from '@/hooks/useLeads';
import { useDesarrollos } from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import useUnidades from '@/hooks/useUnidades';
import { useUserRole } from '@/hooks/useUserRole';

type ResourceKey = 'leads' | 'desarrollos' | 'prototipos' | 'unidades';

// Fix the expected arguments error
export const useResourceActions = (resource: ResourceKey) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { empresaId } = useUserRole();
  
  // Obtener las funciones correctas según el tipo de recurso
  const getActions = () => {
    switch (resource) {
      case 'leads':
        const { createLead, updateLead, deleteLead } = useLeads({ empresa_id: empresaId }); // Pass empresaId here
        return { 
          create: createLead, 
          update: updateLead, 
          delete: deleteLead 
        };
        
      case 'desarrollos':
        const { createDesarrollo, updateDesarrollo, deleteDesarrollo } = useDesarrollos({ empresa_id: empresaId });
        return { 
          create: createDesarrollo, 
          update: updateDesarrollo, 
          delete: deleteDesarrollo 
        };
        
      case 'prototipos':
        const prototipoCrud = usePrototipos();
        // Access the appropriate functions from the usePrototipos hook
        return { 
          create: async (data: any) => {
            // Implementation of create function
            console.log('Creating prototipo with data:', data);
            // Add implementation when available
          }, 
          update: async (id: string, data: any) => {
            // Implementation of update function
            console.log('Updating prototipo with id:', id, 'and data:', data);
            // Add implementation when available
          }, 
          delete: async (id: string) => {
            // Implementation of delete function
            console.log('Deleting prototipo with id:', id);
            // Add implementation when available
          } 
        };
        
      case 'unidades':
        const { createUnidad, updateUnidad, deleteUnidad } = useUnidades();
        return { 
          create: createUnidad, 
          update: updateUnidad, 
          delete: deleteUnidad 
        };
        
      default:
        throw new Error(`Resource type ${resource} is not supported`);
    }
  };
  
  const actions = getActions();
  
  // Función genérica para crear un recurso
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
  
  // Función genérica para actualizar un recurso
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
  
  // Función genérica para eliminar un recurso
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
  
  // Función genérica para redireccionar a la página del recurso
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
