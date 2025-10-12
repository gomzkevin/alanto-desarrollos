import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  mode?: 'overlay' | 'block' | 'hide';
}

export const FeatureGate = ({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true,
  mode = 'overlay'
}: FeatureGateProps) => {
  const { hasFeature, getFeatureUpgradeMessage, getRequiredPlanForFeature } = useFeatureAccess();
  const navigate = useNavigate();
  
  const hasAccess = hasFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Modo hide: no mostrar nada
  if (mode === 'hide') {
    return fallback ? <>{fallback}</> : null;
  }

  // Modo block: mostrar card de upgrade
  if (mode === 'block') {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">Función Premium</CardTitle>
          </div>
          <CardDescription>
            {getFeatureUpgradeMessage(feature)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/dashboard/configuracion?tab=suscripcion')}
            className="w-full"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Actualizar a {getRequiredPlanForFeature(feature)}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Modo overlay (default): mostrar contenido con overlay
  if (showUpgradePrompt) {
    return (
      <div className="relative">
        {/* Contenido bloqueado con blur */}
        <div className="opacity-40 pointer-events-none blur-sm select-none">
          {children}
        </div>
        
        {/* Overlay con botón de upgrade */}
        <div className="fixed inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-50">
          <Card className="max-w-md mx-4 border-2 relative">
            {/* Botón cerrar */}
            <button 
              onClick={() => navigate(-1)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
            
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>Función Premium</CardTitle>
              </div>
              <CardDescription>
                {getFeatureUpgradeMessage(feature)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/dashboard/configuracion?tab=suscripcion')}
                className="w-full"
                size="lg"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Ver Planes y Precios
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return fallback ? <>{fallback}</> : null;
};
