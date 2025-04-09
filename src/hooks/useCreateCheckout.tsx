
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
    setIsLoading(true);
    
    try {
      console.log('Initiating subscription for plan:', planId, 'price ID:', priceId);
      
      // Primero verificamos que tengamos una sesión de autenticación válida
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'No hay sesión de autenticación activa',
          variant: 'destructive',
        });
        return null;
      }
      
      const authUserId = session.user.id;
      
      // Verificar si el usuario existe en la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authUserId)
        .single();

      // Si el usuario no existe en la base de datos, mostramos un error más claro
      if (userError || !userData) {
        console.error('Error obteniendo datos del usuario:', userError);
        toast({
          title: 'Error',
          description: 'Tu perfil de usuario no está configurado correctamente. Por favor, contacta con soporte.',
          variant: 'destructive',
        });
        return null;
      }
      
      console.log('Datos del usuario encontrados:', userData);
      
      // Llamar a nuestro endpoint de Supabase Edge Function con autenticación explícita
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          planId,
          userId: authUserId, // Usar el ID de auth directamente
          empresaId: userData.empresa_id, // Incluir el empresa_id
          email: userData.email,
          successPath
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear la sesión de pago: ' + error.message,
          variant: 'destructive',
        });
        return null;
      }
      
      if (!data || !data.url) {
        console.error('No checkout URL returned:', data);
        toast({
          title: 'Error',
          description: 'No se recibió URL de pago válida',
          variant: 'destructive',
        });
        return null;
      }
      
      console.log('Redirecting to Stripe checkout:', data.url);
      // Redirigir al usuario a la sesión de checkout de Stripe
      window.location.href = data.url;
      return data.url;
    } catch (error) {
      console.error('Error in createCheckoutSession:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar la suscripción: ' + (error.message || error),
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
