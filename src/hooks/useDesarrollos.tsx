import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';

export type Desarrollo = Tables<"desarrollos"> & {
  amenidades?: string[] | null;
};

export type ExtendedDesarrollo = Desarrollo & {
  prototipos?: Tables<"prototipos">[] | null;
};

type FetchDesarrollosOptions = {
  limit?: number;
  withPrototipos?: boolean;
  empresaId?: number | null;
  staleTime?: number;
};

export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { limit, withPrototipos = false, empresaId = null, staleTime = 60000 } = options;
  
  // Función optimizada para obtener desarrollos
  const fetchDesarrollos = async (): Promise<ExtendedDesarrollo[]> => {
    try {
      // Construir la consulta base
      let queryString = '*';
      
      // Si se requieren prototipos, incluirlos en la consulta principal para reducir peticiones
      if (withPrototipos) {
        queryString = `*, prototipos:prototipos(*)`;
      }
      
      let query = supabase.from('desarrollos').select(queryString);
      
      // Filtrar por empresa_id si se proporciona
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }
      
      // Aplicar límite si se proporciona
      if (limit) {
        query = query.limit(limit);
      }
      
      // Ordenar por nombre
      query = query.order('nombre');
      
      const { data: desarrollos, error } = await query;
      
      if (error) {
        console.error('Error fetching desarrollos:', error);
        throw new Error(error.message);
      }
      
      // Procesar desarrollos para manejar las amenidades JSON
      const processedDesarrollos = desarrollos.map(desarrollo => {
        // Parsear amenidades desde JSON a array de strings si existe
        let amenidades: string[] | null = null;
        
        if (desarrollo.amenidades) {
          if (Array.isArray(desarrollo.amenidades)) {
            amenidades = desarrollo.amenidades.map(item => String(item));
          } else if (typeof desarrollo.amenidades === 'string') {
            try {
              const parsed = JSON.parse(desarrollo.amenidades);
              if (Array.isArray(parsed)) {
                amenidades = parsed.map(item => String(item));
              }
            } catch (e) {
              amenidades = [desarrollo.amenidades];
            }
          } else if (typeof desarrollo.amenidades === 'object' && desarrollo.amenidades !== null) {
            const jsonObj = desarrollo.amenidades as Json;
            
            if (Array.isArray(jsonObj)) {
              amenidades = jsonObj.map(item => String(item));
            } else {
              amenidades = Object.values(jsonObj).map(val => String(val));
            }
          }
        }
        
        return {
          ...desarrollo,
          amenidades
        } as ExtendedDesarrollo;
      });
      
      return processedDesarrollos;
    } catch (error) {
      console.error('Error in fetchDesarrollos:', error);
      throw error;
    }
  };

  // Usar React Query con opciones de caché optimizadas
  const queryResult = useQuery({
    queryKey: ['desarrollos', limit, withPrototipos, empresaId],
    queryFn: fetchDesarrollos,
    enabled: empresaId !== null || options.empresaId === undefined,
    staleTime: staleTime, // Usar staleTime configurable
    refetchOnWindowFocus: false // Prevenir refetch innecesarios
  });

  // Check if can add more desarrollos based on subscription limits
  const canAddDesarrollo = async () => {
    try {
      // Fetch subscription data directly instead of using the hook
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userData.user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!subscription) {
        toast({
          title: "Suscripción requerida",
          description: "Necesitas una suscripción activa para crear desarrollos.",
          variant: "destructive",
        });
        return false;
      }
      
      // Extract plan features safely
      const planFeatures = subscription.subscription_plans.features || {};
      let resourceType: 'desarrollo' | 'prototipo' | undefined = undefined;
      let resourceLimit: number | undefined = undefined;
      
      // Check if features is an object (not array) and assign properties safely
      if (planFeatures && typeof planFeatures === 'object' && !Array.isArray(planFeatures)) {
        const featuresObj = planFeatures as { [key: string]: Json };
        resourceType = featuresObj.tipo as 'desarrollo' | 'prototipo' | undefined;
        resourceLimit = typeof featuresObj.max_recursos === 'number' ? featuresObj.max_recursos : undefined;
      }
      
      if (resourceType !== 'desarrollo' && resourceType !== undefined) {
        toast({
          title: "Plan incompatible",
          description: "Tu plan actual no permite la creación de desarrollos. Considera cambiar a un plan por desarrollo.",
          variant: "destructive",
        });
        return false;
      }
      
      if (resourceLimit !== undefined && queryResult.data && queryResult.data.length >= resourceLimit) {
        toast({
          title: "Límite alcanzado",
          description: `Has alcanzado el límite de ${resourceLimit} desarrollos de tu plan. Contacta a soporte para aumentar tu límite.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  // Calculate billing amount for desarrollos
  const calculateBillingAmount = async () => {
    try {
      // Fetch subscription data directly
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return 0;
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userData.user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!subscription) return 0;
      
      // Extract plan features safely
      const planFeatures = subscription.subscription_plans.features || {};
      let resourceType: 'desarrollo' | 'prototipo' | undefined = undefined;
      let precioUnidad: number = 0;
      
      // Check if features is an object (not array) and assign properties safely
      if (planFeatures && typeof planFeatures === 'object' && !Array.isArray(planFeatures)) {
        const featuresObj = planFeatures as { [key: string]: Json };
        resourceType = featuresObj.tipo as 'desarrollo' | 'prototipo' | undefined;
        precioUnidad = typeof featuresObj.precio_por_unidad === 'number' ? featuresObj.precio_por_unidad : 0;
      }
      
      if (resourceType !== 'desarrollo') return 0;
      
      return (queryResult.data?.length || 0) * precioUnidad;
    } catch (error) {
      console.error("Error calculating billing:", error);
      return 0;
    }
  };

  return {
    desarrollos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    empresaId,
    isFetched: queryResult.isFetched,
    canAddDesarrollo,
    calculateBillingAmount,
    isFetching: queryResult.isFetching
  };
};

export default useDesarrollos;
