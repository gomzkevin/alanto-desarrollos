import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useUserRole from './useUserRole';

export interface SecurityEvent {
  id: string;
  event_type: string;
  user_id?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  severity: string; // Changed to string to match database type
  created_at: string;
}

export const useSecurityEvents = () => {
  const { toast } = useToast();
  const { isAdmin, empresaId, isLoading: isUserRoleLoading } = useUserRole();
  
  const fetchSecurityEvents = async (): Promise<SecurityEvent[]> => {
    if (!isAdmin || !empresaId) {
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) {
        console.error('Error fetching security events:', error);
        toast({
          title: 'Error',
          description: `Error al cargar los eventos de seguridad: ${error.message}`,
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in fetchSecurityEvents:', error);
      throw error;
    }
  };
  
  const { data: securityEvents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['security_events', empresaId],
    queryFn: fetchSecurityEvents,
    enabled: !!empresaId && !isUserRoleLoading && isAdmin,
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
  });
  
  return {
    securityEvents,
    isLoading: isLoading || isUserRoleLoading,
    error,
    refetch
  };
};

export default useSecurityEvents;