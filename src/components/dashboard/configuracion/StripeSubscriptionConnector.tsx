
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { updateUsageInformation } from "@/lib/stripe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function StripeSubscriptionConnector() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState("");
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [planId, setPlanId] = useState<string>("");
  const [plans, setPlans] = useState<any[]>([]);
  const { userId, empresaId } = useUserRole();

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price");

      if (error) throw error;
      setPlans(data || []);
      
      // Si hay planes, seleccionar el primero por defecto
      if (data && data.length > 0) {
        setPlanId(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando planes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes de suscripción",
        variant: "destructive",
      });
    }
  };

  const handleOpen = async () => {
    await loadPlans();
    setOpen(true);
  };

  const connectStripeSubscription = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para conectar una suscripción",
        variant: "destructive",
      });
      return;
    }

    if (!stripeSubscriptionId || !planId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Obtener la fecha actual para los campos de periodo
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      // Crear el registro de suscripción en la base de datos
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          empresa_id: empresaId,
          status: "active",
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId || undefined,
          current_period_start: today.toISOString(),
          current_period_end: nextMonth.toISOString(),
          cancel_at_period_end: false,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Suscripción conectada",
        description: "La suscripción de Stripe ha sido conectada correctamente a tu cuenta",
      });
      
      setOpen(false);
      
      // Recargar la página para mostrar la nueva suscripción
      window.location.reload();
    } catch (error) {
      console.error("Error conectando suscripción de Stripe:", error);
      toast({
        title: "Error",
        description: "No se pudo conectar la suscripción de Stripe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleOpen}>
        Conectar Suscripción de Stripe
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Suscripción de Stripe</DialogTitle>
            <DialogDescription>
              Introduce el ID de una suscripción existente en Stripe para conectarla a tu cuenta.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stripeSubscriptionId" className="text-right">
                ID de Suscripción
              </Label>
              <Input
                id="stripeSubscriptionId"
                value={stripeSubscriptionId}
                onChange={(e) => setStripeSubscriptionId(e.target.value)}
                placeholder="sub_1234567890"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stripeCustomerId" className="text-right">
                ID de Cliente (opcional)
              </Label>
              <Input
                id="stripeCustomerId"
                value={stripeCustomerId}
                onChange={(e) => setStripeCustomerId(e.target.value)}
                placeholder="cus_1234567890"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan" className="text-right">
                Plan
              </Label>
              <Select
                value={planId}
                onValueChange={setPlanId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} (${plan.price}/{plan.interval})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={connectStripeSubscription}
              disabled={isLoading}
            >
              {isLoading ? "Conectando..." : "Conectar Suscripción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StripeSubscriptionConnector;
