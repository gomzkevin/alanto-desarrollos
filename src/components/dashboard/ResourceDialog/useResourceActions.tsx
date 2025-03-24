
import useCompanySubscription from '@/hooks/useCompanySubscription';
import { toast } from '@/components/ui/use-toast';
import { ResourceType } from './types';
import { useUserRole } from '@/hooks/useUserRole';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import useOrganizationUsers from '@/hooks/useOrganizationUsers';

export const useResourceActions = (resourceType: ResourceType) => {
  const { userId, empresaId, isAdmin } = useUserRole();
  const { subscriptionInfo } = useCompanySubscription(empresaId);
  
  // Obtener información de desarrollos
  const { desarrollos } = useDesarrollos();
  
  // Obtener información de vendedores
  const { users: vendedores } = useOrganizationUsers({ role: 'vendedor' });
  
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
      case 'vendedores':
        return [];
      case 'unidades':
        return prototipos.map(p => ({ label: p.nombre, value: p.id }));
      case 'cotizaciones':
        return [
          {
            label: 'Desarrollos',
            options: desarrollos.map(d => ({ label: d.nombre, value: d.id }))
          }
        ];
      default:
        return [];
    }
  };
  
  return {
    canAdd: canAddResource(resourceType),
    getSelectOptions,
  };
};

export default useResourceActions;
