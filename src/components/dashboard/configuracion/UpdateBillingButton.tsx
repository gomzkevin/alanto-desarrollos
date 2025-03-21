
import React, { useState } from "react";
import { useSubscriptionInfo } from "@/hooks/useSubscriptionInfo";
import { updateUsageInformation } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export function UpdateBillingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { subscriptionInfo, refetch } = useSubscriptionInfo();
  const { userId } = useUserRole();
  
  const handleUpdateBilling = async () => {
    if (!subscriptionInfo.currentPlan || !subscriptionInfo.isActive) {
      toast({
        title: "Error",
        description: "No hay una suscripción activa para actualizar",
        variant: "destructive",
      });
      return;
    }
    
    // Get the active subscription from database
    const { data: activeSubscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (subError) {
      console.error("Error consultando suscripción:", subError);
      toast({
        title: "Error",
        description: "Error al consultar información de la suscripción",
        variant: "destructive",
      });
      return;
    }
      
    if (!activeSubscription?.stripe_subscription_id) {
      toast({
        title: "Error",
        description: "No se pudo encontrar la información de la suscripción",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log("Actualizando facturación para:", activeSubscription.stripe_subscription_id);
      const result = await updateUsageInformation(activeSubscription.stripe_subscription_id);
      
      console.log("Resultado de actualización:", result);
      
      if (result.success) {
        toast({
          title: "Facturación actualizada",
          description: "La información de facturación ha sido actualizada en base al uso actual",
        });
        
        // Refresh subscription info after update
        await refetch();
      } else {
        throw new Error(result.error || "No se recibió confirmación de éxito del servidor");
      }
    } catch (error) {
      console.error("Error actualizando facturación:", error);
      toast({
        title: "Error",
        description: "Error al actualizar la facturación. Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Don't show the button if there's no active subscription
  if (!subscriptionInfo.isActive || !subscriptionInfo.currentPlan) {
    return null;
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleUpdateBilling}
      disabled={isLoading}
      className="ml-2"
    >
      <RefreshCcw className="mr-2 h-4 w-4" />
      {isLoading ? "Actualizando..." : "Actualizar Facturación"}
    </Button>
  );
}

export default UpdateBillingButton;
