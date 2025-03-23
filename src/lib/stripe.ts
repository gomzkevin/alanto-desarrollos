
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Function to initiate a subscription
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

    toast({
      title: "Procesando",
      description: "Redireccionando a la página de pago...",
    });

    console.log("Initiating subscription for plan:", planId, "user:", userId);

    // Call the Edge Function to create a Stripe checkout session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planId,
        userId,
        successUrl: `${window.location.origin}/dashboard/configuracion?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/configuracion?canceled=true`,
        timestamp: new Date().toISOString() // To avoid caches
      },
    });

    if (error) {
      console.error('Error creating Stripe session:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de suscripción",
        variant: "destructive",
      });
      return null;
    }

    // Redirect user to Stripe checkout page
    if (data?.checkoutUrl) {
      console.log("Redirecting to checkout URL:", data.checkoutUrl);
      window.location.href = data.checkoutUrl;
      return data;
    } else {
      console.error('No checkout URL returned');
      toast({
        title: "Error",
        description: "No se pudo obtener la URL de pago",
        variant: "destructive",
      });
      return null;
    }
  } catch (error) {
    console.error('Error in initiateSubscription:', error);
    toast({
      title: "Error",
      description: "Ocurrió un error al procesar tu solicitud",
      variant: "destructive",
    });
    return null;
  }
};

// Function to cancel a subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-subscription', {
      method: 'POST',  // Explicitly set method to POST
      body: { 
        subscriptionId,
        timestamp: new Date().toISOString() // Para evitar cachés
      },
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
    console.error('Error in cancelSubscription:', error);
    toast({
      title: "Error",
      description: "Ocurrió un error al procesar tu solicitud",
      variant: "destructive",
    });
    return false;
  }
};

// Function to update a subscription
export const updateSubscription = async (subscriptionId: string, newPlanId: string) => {
  try {
    console.log('Cambiando plan de suscripción:', { subscriptionId, newPlanId });
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      method: 'POST',  // Explicitly set method to POST
      body: { 
        subscriptionId, 
        newPlanId,
        // Adding a timestamp to prevent caching
        timestamp: new Date().toISOString()
      },
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
    console.error('Error in updateSubscription:', error);
    toast({
      title: "Error",
      description: "Ocurrió un error al procesar tu solicitud",
      variant: "destructive",
    });
    return false;
  }
};

// Function to update current usage information
export const updateUsageInformation = async (subscriptionId: string) => {
  try {
    console.log('Enviando solicitud de actualización de uso a Edge Function para:', subscriptionId);
    
    const timestamp = Date.now();
    console.log('Timestamp de solicitud:', timestamp);
    
    const { data, error } = await supabase.functions.invoke('update-subscription', {
      method: 'POST',  // Explicitly set method to POST
      body: { 
        subscriptionId, 
        updateUsage: true,
        timestamp: timestamp
      },
    });

    if (error) {
      console.error('Error al actualizar la información de uso:', error);
      return {
        success: false,
        error: `Error en la llamada a la función: ${error.message}`
      };
    }

    console.log('Respuesta de actualización de uso:', data);
    
    if (!data?.success) {
      console.error('Respuesta sin éxito de la función:', data);
      return {
        success: false,
        error: data?.message || 'El servidor no respondió correctamente'
      };
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error in updateUsageInformation:', error);
    return {
      success: false,
      error: `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
    };
  }
};
