
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: {
    max_vendedores?: number;
    max_desarrollos?: number;
    [key: string]: any;
  };
}

interface CurrentSubscription {
  id: string;
  status: string;
  current_period_end: string;
  plan_id: string;
  subscription_plans: SubscriptionPlan;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useUserRole();

  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price');

        if (plansError) {
          throw plansError;
        }

        setPlans(plansData || []);

        // Fetch current subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*, subscription_plans(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        setCurrentSubscription(subData);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de suscripciones.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlansAndSubscription();
  }, [userId]);

  const handleSubscribe = async (planId: string) => {
    // For now, this will just create a mock subscription
    // In a real implementation, this would redirect to Stripe
    try {
      // Check if user already has a subscription
      if (currentSubscription) {
        toast({
          title: "Ya tienes una suscripción activa",
          description: "Contacta a soporte para cambiar de plan.",
        });
        return;
      }

      // Simulate subscription creation
      setIsLoading(true);
      
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (planError) throw planError;
      
      // For demo purposes, create a subscription directly
      // In production, this would be handled by a Stripe webhook
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
        })
        .select('*, subscription_plans(*)');
      
      if (subscriptionError) throw subscriptionError;
      
      if (subscriptionData && subscriptionData.length > 0) {
        setCurrentSubscription(subscriptionData[0]);
      }
      
      toast({
        title: "Suscripción activada",
        description: `Te has suscrito al plan ${planData.name} correctamente.`,
      });
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la suscripción.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planes de Suscripción</CardTitle>
          <CardDescription>Cargando planes disponibles...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planes de Suscripción</CardTitle>
        <CardDescription>
          Elige el plan que mejor se adapte a tus necesidades.
          {currentSubscription && (
            <div className="mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Plan activo: {currentSubscription.subscription_plans.name}
              </Badge>
              <p className="text-sm mt-1">
                Tu suscripción se renovará el {new Date(currentSubscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;
            
            return (
              <Card key={plan.id} className={isCurrentPlan ? "border-2 border-indigo-500" : ""}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.name}
                    {isCurrentPlan && (
                      <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                        Activo
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2 flex items-baseline text-2xl font-semibold">
                    ${plan.price}
                    <span className="ml-1 text-sm font-normal text-slate-500">
                      /{plan.interval === 'month' ? 'mes' : 'año'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {plan.features?.max_desarrollos && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Hasta {plan.features.max_desarrollos} desarrollos
                      </li>
                    )}
                    {plan.features?.max_vendedores && (
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Hasta {plan.features.max_vendedores} vendedores
                      </li>
                    )}
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Soporte por email
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={isCurrentPlan || isLoading}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isCurrentPlan ? 'Plan Actual' : 'Suscribirse'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionPlans;
