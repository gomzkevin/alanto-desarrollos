
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface ResourceCounts {
  isActive: boolean;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: {
      tipo?: 'desarrollo' | 'prototipo';
      precio_por_unidad?: number;
      max_vendedores?: number;
      max_recursos?: number;
    };
  } | null;
  renewalDate: string | null;
  resourceType: 'desarrollo' | 'prototipo' | null;
  resourceLimit: number | null;
  resourceCount: number;
  vendorLimit: number | null;
  vendorCount: number;
  isOverLimit: boolean;
  percentUsed: number;
  isOverVendorLimit: boolean;
  percentVendorUsed: number;
}

export const useResourceCounts = () => {
  const { empresaId } = useUserRole();
  
  const {
    data: counts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['resourceCounts', empresaId],
    queryFn: async (): Promise<ResourceCounts> => {
      // Return default empty counts if no company ID available
      if (!empresaId) {
        return getDefaultCounts();
      }
      
      try {
        // Call our optimized RPC function to get counts and limits
        const { data, error } = await supabase
          .rpc('get_subscription_status', { company_id: empresaId });
          
        if (error) {
          console.error('Error fetching resource counts:', error);
          throw error;
        }
        
        // Transform the returned data
        return processSubscriptionData(data);
      } catch (error) {
        console.error('Error in useResourceCounts:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos de recursos y límites.',
          variant: 'destructive',
        });
        
        return getDefaultCounts();
      }
    },
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Function to check if a new resource can be added
  const canAddResource = async (resourceType: 'desarrollo' | 'prototipo' | 'vendedor', count: number = 1): Promise<boolean> => {
    if (!empresaId) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('check_subscription_limit', {
          company_id: empresaId,
          resource_type: resourceType,
          resources_to_add: count
        });
        
      if (error) {
        console.error('Error checking subscription limit:', error);
        toast({
          title: 'Error',
          description: 'No se pudo verificar el límite de suscripción.',
          variant: 'destructive',
        });
        return false;
      }
      
      // If can't add, show toast explaining why
      if (!data) {
        const resourceTypeText = resourceType === 'desarrollo' 
          ? 'desarrollos' 
          : resourceType === 'prototipo' 
            ? 'prototipos' 
            : 'vendedores';
            
        toast({
          title: 'Límite alcanzado',
          description: `Has alcanzado el límite de ${resourceTypeText} en tu plan actual.`,
          variant: 'destructive',
        });
      }
      
      return data || false;
    } catch (error) {
      console.error('Error in canAddResource:', error);
      return false;
    }
  };

  // Helper function to process the data from the RPC function
  const processSubscriptionData = (data: any): ResourceCounts => {
    if (!data) return getDefaultCounts();
    
    // Calculate derived values
    const resourceLimit = data.resourceLimit || null;
    const resourceCount = data.resourceCount || 0;
    const vendorLimit = data.vendorLimit || null;
    const vendorCount = data.vendorCount || 0;
    
    // Check if over limits
    const isOverLimit = resourceLimit !== null && resourceCount > resourceLimit;
    const isOverVendorLimit = vendorLimit !== null && vendorCount > vendorLimit;
    
    // Calculate percentage used
    const percentUsed = resourceLimit 
      ? Math.min(100, Math.round((resourceCount / resourceLimit) * 100)) 
      : 0;
      
    const percentVendorUsed = vendorLimit 
      ? Math.min(100, Math.round((vendorCount / vendorLimit) * 100)) 
      : 0;
    
    return {
      isActive: data.isActive || false,
      currentPlan: data.currentPlan || null,
      renewalDate: data.renewalDate || null,
      resourceType: data.resourceType || null,
      resourceLimit,
      resourceCount,
      vendorLimit,
      vendorCount,
      isOverLimit,
      percentUsed,
      isOverVendorLimit,
      percentVendorUsed
    };
  };

  // Default empty state for resource counts
  const getDefaultCounts = (): ResourceCounts => ({
    isActive: false,
    currentPlan: null,
    renewalDate: null,
    resourceType: null,
    resourceLimit: null,
    resourceCount: 0,
    vendorLimit: null,
    vendorCount: 0,
    isOverLimit: false,
    percentUsed: 0,
    isOverVendorLimit: false,
    percentVendorUsed: 0
  });

  return {
    resourceCounts: counts || getDefaultCounts(),
    isLoading,
    error,
    refetch,
    canAddResource
  };
};

export default useResourceCounts;
