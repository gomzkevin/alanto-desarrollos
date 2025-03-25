
import { useUserRole } from './useUserRole';

export const usePermissions = () => {
  const { canCreateResource } = useUserRole();
  
  // Función específica para verificar si se pueden crear prototipos
  const canCreatePrototipo = () => canCreateResource('prototipos');
  
  // Función específica para verificar si se pueden crear desarrollos
  const canCreateDesarrollo = () => canCreateResource('desarrollos');
  
  // Función específica para verificar si se pueden crear cotizaciones
  const canCreateCotizacion = () => canCreateResource('cotizaciones');
  
  // Función específica para verificar si se pueden crear leads
  const canCreateLead = () => canCreateResource('leads');
  
  // Función específica para verificar si se pueden crear unidades
  const canCreateUnidad = () => canCreateResource('unidades');
  
  return {
    canCreatePrototipo,
    canCreateDesarrollo,
    canCreateCotizacion,
    canCreateLead,
    canCreateUnidad,
  };
};

export default usePermissions;
