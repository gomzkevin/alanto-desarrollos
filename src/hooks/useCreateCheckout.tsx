
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import { toast } from '@/components/ui/use-toast';

interface CreateCheckoutOptions {
  priceId: string;
  planId: string;
  successPath?: string;
}

export const useCreateCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useUserRole();
  
  const createCheckoutSession = async ({ priceId, planId, successPath }: CreateCheckoutOptions) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para suscribirte',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Initiating subscription for plan:', planId, 'price ID:', priceId);
      
      // Llamar a nuestro endpoint de Supabase Edge Function para crear la sesión de checkout
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          planId,
          userId,
          successPath
        }
      });
      
      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear la sesión de pago',
          variant: 'destructive',
        });
        return null;
      }
      
      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        // Redirigir al usuario a la sesión de checkout de Stripe
        window.location.href = data.url;
        return data.url;
      } else {
        console.error('No checkout URL returned:', data);
        toast({
          title: 'Error',
          description: 'No se recibió URL de pago válida',
          variant: 'destructive',
        });
        return null;
      }
    } catch (error) {
      console.error('Error in createCheckoutSession:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar la suscripción',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { createCheckoutSession, isLoading };
};

export default useCreateCheckout;
