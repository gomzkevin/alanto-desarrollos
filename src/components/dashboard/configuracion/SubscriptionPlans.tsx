import React, { useState, useEffect } from "react";
import { Check, Building, Home, AlertTriangle, ExternalLink, Loader2, Building2, Users, ArrowUpRight } from "lucide-react";
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
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateCheckout } from "@/hooks/useCreateCheckout";

const STRIPE_CUSTOMER_PORTAL_URL = "https://billing.stripe.com/p/login/test_6oE1601ki9u10hy8ww";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripe_price_id?: string;
  features: {
    max_desarrollos?: number;
    max_prototipos?: number;
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
  const [processingPlans, setProcessingPlans] = useState<Record<string, boolean>>({});
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { userId } = useUserRole();
  const { subscriptionInfo } = useSubscriptionInfo();
  const navigate = useNavigate();
  const location = useLocation();
  const { createCheckoutSession, isLoading: isCheckoutLoading } = useCreateCheckout();

  const normalizeFeatures = (features: any): SubscriptionPlan['features'] => {
    if (!features) return {};
    if (typeof features === 'object' && !Array.isArray(features)) return features;
    return {}; // Default empty object if features is not in expected format
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const canceled = params.get('canceled');
    const planId = params.get('plan_id');

    if (success === 'true' && planId) {
      toast({
        title: "¡Suscripción exitosa!",
        description: "Tu suscripción ha sido activada correctamente.",
        variant: "default",
      });
      
      navigate('/dashboard/configuracion', { replace: true });
      
      fetchPlansAndSubscription();
    } else if (canceled === 'true') {
      toast({
        title: "Suscripción cancelada",
        description: "Has cancelado el proceso de suscripción.",
        variant: "destructive",
      });
      
      navigate('/dashboard/configuracion', { replace: true });
    }
  }, [location, navigate]);

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

  useEffect(() => {
    fetchPlansAndSubscription();
  }, [userId]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      setProcessingPlans(prev => ({ ...prev, [plan.id]: true }));
      setProcessingError(null);
      
      if (!plan.stripe_price_id) {
        throw new Error("Este plan no tiene un ID de precio configurado");
      }
      
      console.log("Initiating subscription for plan:", plan.name, "price ID:", plan.stripe_price_id);
      
      const url = await createCheckoutSession({
        priceId: plan.stripe_price_id,
        planId: plan.id,
        successPath: "/dashboard/configuracion"
      });
      
      if (!url) {
        throw new Error("No se recibió la URL de Stripe Checkout");
      }
      
    } catch (error) {
      console.error("Error initiating subscription:", error);
      setProcessingError(error.message || "Ocurrió un error al procesar la suscripción.");
      setShowErrorDialog(true);
    } finally {
      setProcessingPlans(prev => ({ ...prev, [plan.id]: false }));
    }
  };

  const openStripeCustomerPortal = () => {
    window.open(STRIPE_CUSTOMER_PORTAL_URL, '_blank');
  };

  const isActivePlan = (planId: string): boolean => {
    if (currentSubscription?.plan_id === planId) {
      return true;
    }
    
    if (currentSubscription?.subscription_plans?.id === planId) {
      return true;
    }
    
    if (subscriptionInfo.isActive && subscriptionInfo.currentPlan?.id === planId) {
      return true;
    }
    
    return false;
  };

  const isPlanUpgrade = (planPrice: number): boolean => {
    const currentPlanPrice = currentSubscription?.subscription_plans?.price || 
                            subscriptionInfo.currentPlan?.price || 0;
    
    return planPrice > currentPlanPrice;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Planes de Suscripción</CardTitle>
          <CardDescription>Cargando planes disponibles...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error al procesar la suscripción</DialogTitle>
            <DialogDescription>
              Se produjo un error al intentar crear la sesión de pago:
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 text-sm">
            {processingError}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {subscriptionInfo.isActive && subscriptionInfo.currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Suscripción</CardTitle>
            <CardDescription>
              Información de uso y detalles de tu plan actual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Desarrollos */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Desarrollos</h3>
                <div className="flex justify-between text-sm">
                  <span>Usados:</span>
                  <span className="font-medium">
                    {subscriptionInfo.desarrolloCount || 0}
                    {subscriptionInfo.desarrolloLimit ? (
                      <> / {subscriptionInfo.desarrolloLimit}</>
                    ) : null}
                  </span>
                </div>
                {subscriptionInfo.desarrolloLimit ? (
                  <Progress 
                    value={subscriptionInfo.desarrolloLimit > 0 ? 
                      ((subscriptionInfo.desarrolloCount || 0) / subscriptionInfo.desarrolloLimit) * 100 : 0}
                    className={
                      (subscriptionInfo.desarrolloCount || 0) > (subscriptionInfo.desarrolloLimit || 0) 
                        ? "bg-red-100" 
                        : (subscriptionInfo.desarrolloCount || 0) >= (subscriptionInfo.desarrolloLimit || 0)
                          ? "bg-yellow-100"
                          : ""
                    }
                  />
                ) : null}
                {(subscriptionInfo.desarrolloCount || 0) > (subscriptionInfo.desarrolloLimit || 0) && (
                  <div className="flex items-center text-red-500 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Límite excedido</span>
                  </div>
                )}
                {(subscriptionInfo.desarrolloCount || 0) === (subscriptionInfo.desarrolloLimit || 0) && (
                  <div className="flex items-center text-amber-500 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Límite alcanzado</span>
                  </div>
                )}
              </div>

              {/* Prototipos */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Prototipos</h3>
                <div className="flex justify-between text-sm">
                  <span>Usados:</span>
                  <span className="font-medium">
                    {subscriptionInfo.prototipoCount || 0}
                    {subscriptionInfo.prototipoLimit ? (
                      <> / {subscriptionInfo.prototipoLimit}</>
                    ) : null}
                  </span>
                </div>
                {subscriptionInfo.prototipoLimit ? (
                  <Progress 
                    value={subscriptionInfo.prototipoLimit > 0 ? 
                      ((subscriptionInfo.prototipoCount || 0) / (subscriptionInfo.prototipoLimit)) * 100 : 0}
                    className={
                      (subscriptionInfo.prototipoCount || 0) > (subscriptionInfo.prototipoLimit || 0) 
                        ? "bg-red-100" 
                        : (subscriptionInfo.prototipoCount || 0) >= (subscriptionInfo.prototipoLimit || 0)
                          ? "bg-yellow-100"
                          : ""
                    }
                  />
                ) : null}
                {(subscriptionInfo.prototipoCount || 0) > (subscriptionInfo.prototipoLimit || 0) && (
                  <div className="flex items-center text-red-500 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Límite excedido</span>
                  </div>
                )}
                {(subscriptionInfo.prototipoCount || 0) === (subscriptionInfo.prototipoLimit || 0) && (
                  <div className="flex items-center text-amber-500 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Límite alcanzado</span>
                  </div>
                )}
              </div>
              
              {/* Vendedores */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Vendedores</h3>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-medium">
                    {subscriptionInfo.vendorCount || 0}
                    {subscriptionInfo.vendorLimit ? (
                      <> / {subscriptionInfo.vendorLimit}</>
                    ) : null}
                  </span>
                </div>
                {subscriptionInfo.vendorLimit ? (
                  <Progress 
                    value={subscriptionInfo.vendorLimit > 0 ?
                      ((subscriptionInfo.vendorCount || 0) / subscriptionInfo.vendorLimit) * 100 : 0}
                    className={
                      (subscriptionInfo.vendorCount || 0) > (subscriptionInfo.vendorLimit || 0) 
                        ? "bg-red-100" 
                        : (subscriptionInfo.vendorCount || 0) >= (subscriptionInfo.vendorLimit || 0)
                          ? "bg-yellow-100"
                          : ""
                    }
                  />
                ) : null}
                {(subscriptionInfo.vendorCount || 0) > (subscriptionInfo.vendorLimit || 0) && (
                  <div className="flex items-center text-red-500 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Límite excedido</span>
                  </div>
                )}
                {(subscriptionInfo.vendorCount || 0) === (subscriptionInfo.vendorLimit || 0) && (
                  <div className="flex items-center text-amber-500 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Límite alcanzado</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">Detalles de la Suscripción</h3>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Plan actual:</span>
                    <span>{subscriptionInfo.currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Precio:</span>
                    <span>${subscriptionInfo.currentPlan.price}/{subscriptionInfo.currentPlan.interval === 'month' ? 'mes' : 'año'}</span>
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
                      {subscriptionInfo.renewalDate ? 
                        new Date(subscriptionInfo.renewalDate).toLocaleDateString() : 
                        'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={openStripeCustomerPortal}
            >
              Gestionar Suscripción <ExternalLink className="ml-2 h-4 w-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrentPlan = isActivePlan(plan.id);
              const isPlanProcessing = processingPlans[plan.id] || false;
              const canUpgrade = !isCurrentPlan && isPlanUpgrade(plan.price);
              
              return (
                <Card key={plan.id} className={isCurrentPlan ? "border-2 border-indigo-500" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
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
                      {plan.features?.max_desarrollos && (
                        <li className="flex items-center">
                          <Building2 className="h-4 w-4 mr-2 text-green-500" />
                          Hasta {plan.features.max_desarrollos} {plan.features.max_desarrollos === 1 ? 'desarrollo' : 'desarrollos'}
                        </li>
                      )}
                      {plan.features?.max_prototipos && (
                        <li className="flex items-center">
                          <Home className="h-4 w-4 mr-2 text-green-500" />
                          Hasta {plan.features.max_prototipos} {plan.features.max_prototipos === 1 ? 'prototipo' : 'prototipos'}
                        </li>
                      )}
                      {plan.features?.max_vendedores && (
                        <li className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-green-500" />
                          Hasta {plan.features.max_vendedores} {plan.features.max_vendedores === 1 ? 'vendedor' : 'vendedores'}
                        </li>
                      )}
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Acceso a todas las características
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Soporte por email
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    {isCurrentPlan ? (
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        onClick={openStripeCustomerPortal}
                      >
                        Plan Actual <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    ) : currentSubscription && canUpgrade ? (
                      <Button 
                        className="w-full" 
                        variant="default"
                        disabled={isPlanProcessing}
                        onClick={openStripeCustomerPortal}
                      >
                        {isPlanProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            Mejorar Plan <ArrowUpRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : currentSubscription ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        disabled={isPlanProcessing}
                        onClick={openStripeCustomerPortal}
                      >
                        {isPlanProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            Cambiar Plan <ExternalLink className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        disabled={isPlanProcessing}
                        onClick={() => handleSubscribe(plan)}
                      >
                        {isPlanProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            Suscribirse <ExternalLink className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
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
