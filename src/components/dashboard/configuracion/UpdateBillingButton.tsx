
import React, { useState } from "react";
import { useSubscriptionInfo } from "@/hooks/useSubscriptionInfo";
import { updateUsageInformation } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { RefreshCcw } from "lucide-react";

export function UpdateBillingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { subscription } = useSubscriptionInfo();
  
  const handleUpdateBilling = async () => {
    if (!subscription?.stripe_subscription_id) {
      toast({
        title: "Error",
        description: "No hay una suscripción activa para actualizar",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const success = await updateUsageInformation(subscription.stripe_subscription_id);
      
      if (success) {
        toast({
          title: "Facturación actualizada",
          description: "La información de facturación ha sido actualizada en base al uso actual",
        });
      }
    } catch (error) {
      console.error("Error actualizando facturación:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información de facturación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!subscription) {
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
