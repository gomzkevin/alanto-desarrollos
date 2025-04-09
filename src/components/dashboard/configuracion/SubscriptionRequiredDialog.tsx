
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useCreateCheckout } from '@/hooks/useCreateCheckout';

// ID de precio del plan básico
const BASIC_PLAN_PRICE_ID = "price_1R4sdgAmHdZStjAGho30y55V";
const BASIC_PLAN_ID = "prod_S6JeOdnRQLuPxV";

export function SubscriptionRequiredDialog() {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { createCheckoutSession, isLoading } = useCreateCheckout();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      const url = await createCheckoutSession({
        priceId: BASIC_PLAN_PRICE_ID,
        planId: BASIC_PLAN_ID,
        successPath: "/dashboard/configuracion"
      });
      
      if (!url) {
        toast({
          title: 'Error',
          description: 'No se pudo iniciar el proceso de suscripción',
          variant: 'destructive',
        });
      }
      
    } catch (error) {
      console.error('Error al iniciar suscripción:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un problema al procesar la solicitud',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToPlans = () => {
    navigate('/planes', { replace: true });
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-amber-800">
            Se requiere una suscripción
          </CardTitle>
        </div>
        <CardDescription className="text-amber-700">
          Para continuar utilizando todas las funcionalidades de la aplicación, debe activar una suscripción.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-amber-700">
        <p>
          Su empresa actualmente no cuenta con una suscripción activa. Para desbloquear todas las características y
          continuar gestionando sus desarrollos inmobiliarios, elija un plan de suscripción.
        </p>
        
        {!isAdmin() && (
          <p className="mt-2 font-medium">
            Esta acción requiere permisos de administrador. Por favor, contacte al administrador de su empresa.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-4 justify-end">
        <Button 
          variant="outline" 
          onClick={handleGoToPlans}
        >
          Ver todos los planes
        </Button>
        
        {isAdmin() && (
          <Button 
            variant="default"
            onClick={handleSubscribe}
            disabled={isProcessing || isLoading}
          >
            {(isProcessing || isLoading) ? 'Procesando...' : 'Suscribirse ahora'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default SubscriptionRequiredDialog;
