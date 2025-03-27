
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SubscriptionPlans from './SubscriptionPlans';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { Loader2 } from 'lucide-react';

interface SubscriptionRequiredDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SubscriptionRequiredDialog({ open, onOpenChange }: SubscriptionRequiredDialogProps) {
  const { subscriptionInfo, isLoading } = useSubscriptionInfo();
  const [internalOpen, setInternalOpen] = useState(open);
  const navigate = useNavigate();
  
  // Asegurarse de que el diálogo permanezca abierto si no hay suscripción activa
  useEffect(() => {
    if (!isLoading && !subscriptionInfo.isActive) {
      setInternalOpen(true);
    } else if (subscriptionInfo.isActive) {
      setInternalOpen(false);
      // Navegar al dashboard si ya tiene suscripción activa
      navigate('/dashboard');
    }
  }, [isLoading, subscriptionInfo.isActive, navigate]);
  
  // Este controlador garantiza que el diálogo no se pueda cerrar si no hay suscripción
  const handleOpenChange = (newOpen: boolean) => {
    // Solo permitir cerrar si hay una suscripción activa
    if (!newOpen && subscriptionInfo.isActive) {
      setInternalOpen(false);
      if (onOpenChange) onOpenChange(false);
    } else {
      setInternalOpen(true);
      if (onOpenChange) onOpenChange(true);
    }
  };
  
  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suscripción Requerida</DialogTitle>
          <DialogDescription>
            Para continuar usando la plataforma, es necesario contar con una suscripción activa. 
            Por favor, selecciona un plan de suscripción a continuación.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <SubscriptionPlans />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionRequiredDialog;
