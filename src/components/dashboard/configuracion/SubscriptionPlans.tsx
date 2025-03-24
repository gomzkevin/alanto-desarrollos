import React, { useState, useEffect } from "react";
import { Check, Building, Home, AlertTriangle } from "lucide-react";
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
import { useSubscription } from "@/hooks/useSubscription";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: {
    tipo?: 'desarrollo' | 'prototipo';
    precio_por_unidad?: number;
    max_vendedores?: number;
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
  const { subscription } = useSubscription();

  const normalizeFeatures = (features: any): SubscriptionPlan['features'] => {
    if (!features) return {};
    if (typeof features === 'object' && !Array.isArray(features)) return features;
    return {}; // Default empty object if features is not in expected format
  };

  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price');

        if (plansError) {
          throw plansError;
        }

        const typedPlans: SubscriptionPlan[] = plansData?.map(plan => ({
          ...plan,
          interval: plan.interval === 'year' ? 'year' : 'month' as 'month' | 'year',
          features: normalizeFeatures(plan.features)
        })) || [];

        setPlans(typedPlans);

        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*, subscription_plans(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        if (subData) {
          const typedSubscription: CurrentSubscription = {
            ...subData,
            subscription_plans: {
              ...subData.subscription_plans,
              interval: subData.subscription_plans.interval === 'year' 
                ? 'year' 
                : 'month' as 'month' | 'year',
              features: normalizeFeatures(subData.subscription_plans.features)
            }
          };
          
          setCurrentSubscription(typedSubscription);
        }
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
    try {
      if (currentSubscription) {
        toast({
          title: "Ya tienes una suscripción activa",
          description: "Contacta a soporte para cambiar de plan.",
        });
        return;
      }

      setIsLoading(true);
      
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (planError) throw planError;
      
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('*, subscription_plans(*)');
      
      if (subscriptionError) throw subscriptionError;
      
      if (subscriptionData && subscriptionData.length > 0) {
        const typedSubscription: CurrentSubscription = {
          ...subscriptionData[0],
          subscription_plans: {
            ...subscriptionData[0].subscription_plans,
            interval: subscriptionData[0].subscription_plans.interval === 'year' 
              ? 'year' 
              : 'month' as 'month' | 'year',
            features: normalizeFeatures(subscriptionData[0].subscription_plans.features)
          }
        };
        
        setCurrentSubscription(typedSubscription);
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
    <div className="space-y-6">
      {subscription.isActive && subscription.currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Facturación</CardTitle>
            <CardDescription>
              Información de uso y facturación estimada para tu plan actual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Uso de Recursos</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {subscription.resourceType === 'desarrollo' ? 'Desarrollos:' : 'Prototipos:'}
                    </span>
                    <span className="font-medium">
                      {subscription.resourceCount}
                      {subscription.resourceLimit && (
                        <> / {subscription.resourceLimit}</>
                      )}
                    </span>
                  </div>
                  {subscription.resourceLimit && (
                    <Progress 
                      value={subscription.percentUsed} 
                      className={subscription.isOverLimit ? "bg-red-100" : ""}
                    />
                  )}
                  {subscription.isOverLimit && (
                    <div className="flex items-center text-red-500 text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Excediste el límite de tu plan</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Vendedores</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total de vendedores:</span>
                    <span className="font-medium">
                      {subscription.vendorCount}
                      {subscription.vendorLimit && (
                        <> / {subscription.vendorLimit}</>
                      )}
                    </span>
                  </div>
                  {subscription.vendorLimit && (
                    <Progress 
                      value={(subscription.vendorCount / subscription.vendorLimit) * 100} 
                      className={subscription.isOverVendorLimit ? "bg-red-100" : ""}
                    />
                  )}
                  {subscription.isOverVendorLimit && (
                    <div className="flex items-center text-red-500 text-xs gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Excediste el límite de vendedores</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Resumen de Facturación</h3>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Plan base:</span>
                    <span>${subscription.currentPlan.price}/{subscription.currentPlan.interval}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {subscription.resourceCount} {subscription.resourceType === 'desarrollo' ? 'desarrollos' : 'prototipos'} x 
                      ${subscription.currentPlan.features.precio_por_unidad}:
                    </span>
                    <span>${subscription.currentBilling}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total estimado:</span>
                    <span>${subscription.currentPlan.price + subscription.currentBilling}/{subscription.currentPlan.interval}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Detalles de la Suscripción</h3>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Plan actual:</span>
                    <span>{subscription.currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estado:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Activo
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Próxima renovación:</span>
                    <span>
                      {subscription.renewalDate?.toLocaleDateString() || 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Gestionar Suscripción
            </Button>
          </CardFooter>
        </Card>
      )}

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const isCurrentPlan = currentSubscription?.plan_id === plan.id;
              const planIcon = plan.features?.tipo === 'desarrollo' ? Building : Home;
              
              return (
                <Card key={plan.id} className={isCurrentPlan ? "border-2 border-indigo-500" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {React.createElement(planIcon, { className: "h-5 w-5" })}
                        {plan.name}
                      </CardTitle>
                      {isCurrentPlan && (
                        <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                          Activo
                        </Badge>
                      )}
                    </div>
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
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        ${plan.features?.precio_por_unidad} por cada {plan.features?.tipo === 'desarrollo' ? 'desarrollo' : 'prototipo'}
                      </li>
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
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        {plan.features?.tipo === 'desarrollo' 
                          ? 'Ideal para empresas con pocos desarrollos grandes' 
                          : 'Perfecto para empresas con múltiples prototipos pequeños'}
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
    </div>
  );
}

export default SubscriptionPlans;
