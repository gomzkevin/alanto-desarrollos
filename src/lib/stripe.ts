
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Función para iniciar una suscripción
export const initiateSubscription = async (planId: string, userId: string) => {
  try {    
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para suscribirte",
        variant: "destructive",
      });
      return null;
    }

    // Llamar a una función API para crear una sesión de Stripe
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planId,
        userId,
        successUrl: `${window.location.origin}/dashboard/configuracion?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/configuracion?canceled=true`,
      },
    });

    if (error) {
      console.error('Error al crear la sesión de Stripe:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de suscripción",
        variant: "destructive",
      });
      return null;
    }

    // Redirigir al usuario a la página de checkout de Stripe
    if (data?.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
    
    return data;
  } catch (error) {
    console.error('Error en initiateSubscription:', error);
    toast({
      title: "Error",
      description: "Ocurrió un error al procesar tu solicitud",
      variant: "destructive",
    });
    return null;
  }
};

// Función para cancelar una suscripción
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      body: { subscriptionId },
    });

    if (error) {
      console.error('Error al cancelar la suscripción:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Suscripción cancelada",
      description: "Tu suscripción se cancelará al final del período de facturación",
    });
    
    return true;
  } catch (error) {
    console.error('Error en cancelSubscription:', error);
    toast({
      title: "Error",
      description: "Ocurrió un error al procesar tu solicitud",
      variant: "destructive",
    });
    return false;
  }
};

// Función para modificar una suscripción
export const updateSubscription = async (subscriptionId: string, newPlanId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      body: { subscriptionId, newPlanId },
    });

    if (error) {
      console.error('Error al actualizar la suscripción:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la suscripción",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Suscripción actualizada",
      description: "Tu suscripción ha sido actualizada exitosamente",
    });
    
    return true;
  } catch (error) {
    console.error('Error en updateSubscription:', error);
    toast({
      title: "Error",
      description: "Ocurrió un error al procesar tu solicitud",
      variant: "destructive",
    });
    return false;
  }
};

// Función para actualizar la información de uso actual
export const updateUsageInformation = async (subscriptionId: string) => {
  try {
    console.log('Enviando solicitud de actualización de uso a Edge Function para:', subscriptionId);
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      body: { 
        subscriptionId, 
        updateUsage: true,
        timestamp: new Date().toISOString() // Añadir marca de tiempo para evitar cachés
      },
    });

    if (error) {
      console.error('Error al actualizar la información de uso:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información de facturación",
        variant: "destructive",
      });
      return false;
    }

    if (!data?.success) {
      console.error('Respuesta sin éxito de la función:', data);
      return false;
    }

    console.log('Respuesta de actualización de uso:', data);
    
    return true;
  } catch (error) {
    console.error('Error en updateUsageInformation:', error);
    toast({
      title: "Error",
      description: "Ocurrió un error al procesar tu solicitud",
      variant: "destructive",
    });
    return false;
  }
};
