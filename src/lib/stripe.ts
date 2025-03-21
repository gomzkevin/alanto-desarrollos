
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
      method: 'POST',  // Explicitly set method to POST
      body: {
        planId,
        userId,
        successUrl: `${window.location.origin}/dashboard/configuracion?success=true`,
        cancelUrl: `${window.location.origin}/dashboard/configuracion?canceled=true`,
        timestamp: new Date().toISOString() // Para evitar cachés
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
    console.error('Error en updateUsageInformation:', error);
    return {
      success: false,
      error: `Error: ${error.message || "Error desconocido"}`
    };
  }
};
