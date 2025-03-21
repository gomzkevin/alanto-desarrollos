
import React, { useState } from "react";
import { useSubscriptionInfo } from "@/hooks/useSubscriptionInfo";
import { updateUsageInformation } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { RefreshCcw, Power } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export function UpdateBillingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { subscriptionInfo, refetch } = useSubscriptionInfo();
  const { userId } = useUserRole();
  const navigate = useNavigate();
  
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
          description: "La información de uso ha sido actualizada correctamente",
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

  const handleDeactivateSubscription = async () => {
    try {
      setIsDeactivating(true);
      
      // Get the active subscription from database
      const { data: activeSubscription, error: subError } = await supabase
        .from('subscriptions')
        .select('id, stripe_subscription_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
        
      if (subError) {
        console.error("Error consultando suscripción:", subError);
        throw new Error("Error al consultar información de la suscripción");
      }
        
      if (!activeSubscription?.id) {
        throw new Error("No se pudo encontrar una suscripción activa");
      }
      
      console.log("Desactivando suscripción ID:", activeSubscription.id);
      
      // Mark the subscription as inactive in the database - adding a more explicit log
      console.log("Estado antes de actualizar:", 'active', "cambiando a:", 'inactive');
      
      const { data: updateData, error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'inactive', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', activeSubscription.id)
        .select();
      
      if (updateError) {
        console.error("Error desactivando suscripción:", updateError);
        throw new Error("Error al desactivar la suscripción");
      }
      
      console.log("Resultado de actualización:", updateData);
      
      toast({
        title: "Suscripción desactivada",
        description: "La suscripción ha sido desactivada con éxito. Ahora puedes iniciar una nueva suscripción.",
      });
      
      setDialogOpen(false);
      
      // Force a complete refresh of the application
      setTimeout(() => {
        console.log("Recargando página...");
        window.location.href = '/dashboard/configuracion';
      }, 1000);
      
    } catch (error) {
      console.error("Error desactivando suscripción:", error);
      toast({
        title: "Error",
        description: error.message || "Error al desactivar la suscripción",
        variant: "destructive",
      });
    } finally {
      setIsDeactivating(false);
    }
  };
  
  // Don't show the button if there's no active subscription
  if (!subscriptionInfo.isActive || !subscriptionInfo.currentPlan) {
    return null;
  }
  
  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleUpdateBilling}
          disabled={isLoading}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          {isLoading ? "Actualizando..." : "Actualizar Facturación"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="text-red-500 hover:text-red-600 hover:border-red-300"
        >
          <Power className="mr-2 h-4 w-4" />
          Desactivar Suscripción
        </Button>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Suscripción</DialogTitle>
            <DialogDescription>
              Esta acción desactivará tu suscripción actual en la base de datos para propósitos de prueba. 
              La suscripción en Stripe no será cancelada, pero podrás iniciar una nueva suscripción.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeactivateSubscription}
              disabled={isDeactivating}
            >
              {isDeactivating ? "Desactivando..." : "Confirmar Desactivación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateBillingButton;
