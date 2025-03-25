
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Crea una sesión de checkout de Stripe para suscripción
 * @param priceId ID del precio en Stripe
 * @param planId ID del plan de suscripción en la base de datos
 * @param userId ID del usuario actual
 * @param successPath Ruta a la que redirigir tras el éxito
 * @returns URL de la sesión de checkout o null si hubo un error
 */
export async function createCheckoutSession(
  priceId: string,
  planId: string,
  userId: string,
  successPath: string = "/dashboard/configuracion"
): Promise<string | null> {
  try {
    console.log(`Iniciando sesión de checkout para: ${priceId}, ${planId}, ${userId}`);
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId,
        planId,
        userId,
        successPath
      }
    });
    
    if (error) {
      console.error("Error de función edge:", error);
      toast({
        title: "Error al crear sesión de pago",
        description: error.message || "No se pudo conectar con Stripe. Intenta de nuevo más tarde.",
        variant: "destructive",
      });
      return null;
    }
    
    if (!data?.url) {
      console.error("Respuesta incompleta:", data);
      toast({
        title: "Error al crear sesión de pago",
        description: "No se recibió la URL de Stripe Checkout.",
        variant: "destructive",
      });
      return null;
    }
    
    console.log("URL de checkout recibida:", data.url);
    return data.url;
    
  } catch (error) {
    console.error("Error al crear sesión de checkout:", error);
    toast({
      title: "Error inesperado",
      description: "Ocurrió un error al procesar la solicitud. Intenta de nuevo más tarde.",
      variant: "destructive",
    });
    return null;
  }
}
