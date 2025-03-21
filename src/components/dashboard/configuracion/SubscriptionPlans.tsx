
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
import { useSubscriptionInfo } from "@/hooks/useSubscriptionInfo";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { initiateSubscription, cancelSubscription, updateSubscription } from "@/lib/stripe";
import { useLocation, useNavigate } from "react-router-dom";
import { UpdateBillingButton } from "./UpdateBillingButton";

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
  stripe_price_id?: string;
}

interface CurrentSubscription {
  id: string;
  status: string;
  current_period_end: string;
  plan_id: string;
  subscription_plans: SubscriptionPlan;
  stripe_subscription_id?: string;
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { userId } = useUserRole();
  const { subscriptionInfo, refetch: refetchSubscriptionInfo } = useSubscriptionInfo();
  const location = useLocation();
  const navigate = useNavigate();

  // Revised useEffect for URL parameters and forced refresh
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const refresh = searchParams.get('refresh');
    
    if (success) {
      toast({
        title: "Suscripción completada",
        description: "Tu suscripción ha sido activada correctamente.",
      });
      navigate('/dashboard/configuracion', { replace: true });
    } else if (canceled) {
      toast({
        title: "Suscripción cancelada",
        description: "Has cancelado el proceso de suscripción.",
        variant: "destructive",
      });
      navigate('/dashboard/configuracion', { replace: true });
    } else if (refresh) {
      // Force a refetch of subscription data
      refetchSubscriptionInfo();
      navigate('/dashboard/configuracion', { replace: true });
    }
  }, [location, navigate, refetchSubscriptionInfo]);

  const normalizeFeatures = (features: any): SubscriptionPlan['features'] => {
    if (!features) return {};
    if (typeof features === 'object' && !Array.isArray(features)) return features;
    return {};
  };

  useEffect(() => {
    console.log("Subscription status in SubscriptionPlans:", subscriptionInfo.isActive);
    
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

        // Check explicitly for active subscriptions
        console.log("Fetching active subscription for user:", userId);
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*, subscription_plans(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        console.log("Subscription query result:", subData, subError);

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        if (subData) {
          console.log("Found active subscription:", subData);
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
        } else {
          console.log("No active subscription found");
          setCurrentSubscription(null);
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
  }, [userId, subscriptionInfo.isActive]);

  const handleSubscribe = async (planId: string) => {
    try {
      if (currentSubscription) {
        if (!currentSubscription.stripe_subscription_id) {
          toast({
            title: "Error",
            description: "No se encontró información de suscripción en Stripe.",
            variant: "destructive",
          });
          return;
        }
        
        setProcessingPlanId(planId);
        
        const success = await updateSubscription(
          currentSubscription.stripe_subscription_id, 
          planId
        );
        
        if (success) {
          toast({
            title: "Plan actualizado",
            description: "Tu plan de suscripción ha sido actualizado correctamente.",
          });
          
          window.location.reload();
        }
        
        return;
      }

      setProcessingPlanId(planId);
      
      // Pass userId to initiateSubscription
      await initiateSubscription(planId, userId);
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la suscripción.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription?.stripe_subscription_id) {
      toast({
        title: "Error",
        description: "No se encontró información de suscripción.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const success = await cancelSubscription(currentSubscription.stripe_subscription_id);
      
      if (success) {
        setCurrentSubscription({
          ...currentSubscription,
          status: 'active_canceling',
        });
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción.",
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
      {subscriptionInfo.isActive && subscriptionInfo.currentPlan && (
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
                      {subscriptionInfo.resourceType === 'desarrollo' ? 'Desarrollos:' : 'Prototipos:'}
                    </span>
                    <span className="font-medium">
                      {subscriptionInfo.resourceCount}
                      {subscriptionInfo.resourceLimit && (
                        <> / {subscriptionInfo.resourceLimit}</>
                      )}
                    </span>
                  </div>
                  {subscriptionInfo.resourceLimit && (
                    <Progress 
                      value={subscriptionInfo.percentUsed} 
                      className={subscriptionInfo.isOverLimit ? "bg-red-100" : ""}
                    />
                  )}
                  {subscriptionInfo.isOverLimit && (
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
                      {subscriptionInfo.vendorCount}
                      {subscriptionInfo.vendorLimit && (
                        <> / {subscriptionInfo.vendorLimit}</>
                      )}
                    </span>
                  </div>
                  {subscriptionInfo.vendorLimit && (
                    <Progress 
                      value={(subscriptionInfo.vendorCount / subscriptionInfo.vendorLimit) * 100} 
                      className={subscriptionInfo.isOverVendorLimit ? "bg-red-100" : ""}
                    />
                  )}
                  {subscriptionInfo.isOverVendorLimit && (
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
                    <span>${subscriptionInfo.currentPlan.price}/{subscriptionInfo.currentPlan.interval}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {subscriptionInfo.resourceCount} {subscriptionInfo.resourceType === 'desarrollo' ? 'desarrollos' : 'prototipos'} x 
                      ${subscriptionInfo.currentPlan.features.precio_por_unidad}:
                    </span>
                    <span>${subscriptionInfo.currentBilling}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total estimado:</span>
                    <span>${subscriptionInfo.currentPlan.price + subscriptionInfo.currentBilling}/{subscriptionInfo.currentPlan.interval}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium">Detalles de la Suscripción</h3>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Plan actual:</span>
                    <span>{subscriptionInfo.currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estado:</span>
                    <Badge variant="outline" className={
                      currentSubscription?.status === 'active_canceling' 
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }>
                      {currentSubscription?.status === 'active_canceling' 
                        ? 'Cancelación programada' 
                        : 'Activo'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Próxima renovación:</span>
                    <span>
                      {subscriptionInfo.renewalDate?.toLocaleDateString() || 'No disponible'}
                      {currentSubscription?.status === 'active_canceling' && " (No se renovará)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <div className="flex gap-2 w-full">
                <UpdateBillingButton />
                <Button 
                  variant={currentSubscription?.status === 'active_canceling' ? "outline" : "default"} 
                  className="flex-1"
                  onClick={handleCancelSubscription}
                  disabled={currentSubscription?.status === 'active_canceling' || isLoading}
                >
                  {currentSubscription?.status === 'active_canceling' 
                    ? 'Cancelación programada' 
                    : 'Cancelar Suscripción'}
                </Button>
              </div>
              {currentSubscription?.status === 'active_canceling' && (
                <p className="text-xs text-center text-gray-500">
                  Tu suscripción permanecerá activa hasta el final del período actual.
                </p>
              )}
            </div>
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
                <Badge variant="outline" className={
                  currentSubscription.status === 'active_canceling' 
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }>
                  Plan activo: {currentSubscription.subscription_plans.name}
                  {currentSubscription.status === 'active_canceling' && " (Cancelación programada)"}
                </Badge>
                <p className="text-sm mt-1">
                  Tu suscripción {currentSubscription.status === 'active_canceling' ? 'estará activa hasta' : 'se renovará el'} {new Date(currentSubscription.current_period_end).toLocaleDateString()}
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
                      disabled={isCurrentPlan || isLoading || processingPlanId === plan.id}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {processingPlanId === plan.id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        isCurrentPlan ? 'Plan Actual' : 'Suscribirse'
                      )}
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
