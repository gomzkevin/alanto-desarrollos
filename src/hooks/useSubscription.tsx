
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: {
    tipo?: 'desarrollo' | 'prototipo';
    precio_por_unidad?: number;
    max_vendedores?: number;
    max_recursos?: number;
  };
}

export interface SubscriptionInfo {
  currentPlan: SubscriptionPlan | null;
  isActive: boolean;
  renewalDate: Date | null;
  resourceCount: number;
  resourceLimit: number | null;
  resourceType: 'desarrollo' | 'prototipo' | null;
  currentBilling: number;
  isOverLimit: boolean;
  percentUsed: number;
  vendorCount: number;
  vendorLimit: number | null;
  isOverVendorLimit: boolean;
}

export interface SubscriptionAuthOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

/**
 * Hook centralizado simplificado que solo verifica autenticación básica
 * Sin ninguna lógica de suscripciones o consultas a Supabase
 */
export const useSubscription = (options: SubscriptionAuthOptions = {}) => {
  const { redirectPath = '/dashboard' } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, authChecked, isLoading: isUserLoading } = useUserRole();
  
  // Valores por defecto para suscripción
  const defaultSubscription: SubscriptionInfo = {
    currentPlan: null,
    isActive: true,
    renewalDate: null,
    resourceCount: 0,
    resourceLimit: null,
    resourceType: null,
    currentBilling: 0,
    isOverLimit: false,
    percentUsed: 0,
    vendorCount: 0,
    vendorLimit: null,
    isOverVendorLimit: false
  };

  // Efecto para verificar autorización básica
  useEffect(() => {
    if (!authChecked) {
      return;
    }

    // Si no hay userId, no está autorizado
    if (!userId) {
      setIsAuthorized(false);
      return;
    }

    // Verificar que el usuario tenga una empresa asignada
    if (!empresaId) {
      toast({
        title: "Sin acceso",
        description: "No tienes una empresa asignada. Contacta al administrador.",
        variant: "destructive"
      });
      navigate(redirectPath);
      setIsAuthorized(false);
      return;
    }

    // Si el usuario está autenticado y tiene empresa, está autorizado
    setIsAuthorized(true);
  }, [authChecked, userId, empresaId, redirectPath, navigate]);

  return {
    subscription: defaultSubscription,
    isLoading: isUserLoading || !authChecked || isAuthorized === null,
    isAuthorized,
    error: null
  };
};

export default useSubscription;
