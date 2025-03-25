
import React, { useState, useEffect } from "react";
import { Check, Building, Home, AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
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

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripe_price_id?: string;
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
  // Cambiamos el estado isProcessing a un objeto mapeado por plan_id para un seguimiento por plan
  const [processingPlans, setProcessingPlans] = useState<Record<string, boolean>>({});
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { userId } = useUserRole();
  const { subscriptionInfo } = useSubscriptionInfo();
  const navigate = useNavigate();
  const location = useLocation();

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
      if (currentSubscription) {
        toast({
          title: "Ya tienes una suscripción activa",
          description: "Contacta a soporte para cambiar de plan.",
        });
        return;
      }

      // Cambiamos para marcar como procesando solo el plan específico
      setProcessingPlans(prev => ({ ...prev, [plan.id]: true }));
      setProcessingError(null);
      
      if (!plan.stripe_price_id) {
        throw new Error("Este plan no tiene un ID de precio configurado");
      }
      
      console.log("Initiating subscription for plan:", plan.name, "price ID:", plan.stripe_price_id);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.stripe_price_id,
          planId: plan.id,
          userId: userId,
          successPath: "/dashboard/configuracion"
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        setProcessingError(error.message || "Error al procesar la solicitud");
        setShowErrorDialog(true);
        return;
      }
      
      if (data?.url) {
        console.log("Redirecting to Stripe checkout:", data.url);
        setCheckoutUrl(data.url);
        // Redirigir directamente en lugar de usar setTimeout
        window.location.href = data.url;
      } else {
        throw new Error("No se recibió la URL de Stripe Checkout");
      }
      
    } catch (error) {
      console.error("Error initiating subscription:", error);
      setProcessingError(error.message || "Ocurrió un error al procesar la suscripción.");
      setShowErrorDialog(true);
    } finally {
      // Limpiamos solo el estado del plan específico
      setProcessingPlans(prev => ({ ...prev, [plan.id]: false }));
    }
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
      {/* Error Dialog */}
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

      {/* Resumen de facturación */}
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
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Activo
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Próxima renovación:</span>
                    <span>
                      {subscriptionInfo.renewalDate?.toLocaleDateString() || 'No disponible'}
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
              // Verificamos si este plan específico está procesando
              const isPlanProcessing = processingPlans[plan.id] || false;
              
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
                      disabled={isCurrentPlan || isPlanProcessing}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {isPlanProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : isCurrentPlan ? (
                        'Plan Actual'
                      ) : (
                        <>
                          Suscribirse <ExternalLink className="ml-2 h-4 w-4" />
                        </>
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
