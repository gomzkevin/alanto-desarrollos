
import React from 'react';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import SubscriptionPlans from './SubscriptionPlans';
import { Loader2 } from 'lucide-react';

interface SubscriptionRequiredDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SubscriptionRequiredDialog({ open, onOpenChange }: SubscriptionRequiredDialogProps) {
  const { subscriptionInfo, isLoading } = useSubscriptionInfo();
  
  // Si hay una suscripción activa, no mostrar nada
  if (!isLoading && subscriptionInfo.isActive) {
    return null;
  }
  
  return (
    <div className="space-y-6 mb-8">
      <Alert variant="warning" className="bg-amber-50 border-amber-200">
        <AlertTitle className="text-amber-800 text-lg font-semibold">
          Se requiere una suscripción
        </AlertTitle>
        <AlertDescription className="text-amber-700">
          Para continuar usando todas las funciones de la plataforma, es necesario contar con una suscripción activa.
          Por favor, selecciona un plan de suscripción a continuación.
        </AlertDescription>
      </Alert>
      
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <SubscriptionPlans />
      )}
    </div>
  );
}

export default SubscriptionRequiredDialog;
