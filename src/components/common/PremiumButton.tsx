import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Button, ButtonProps } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends ButtonProps {
  feature: string;
  onUpgradeClick?: () => void;
}

export const PremiumButton = ({ 
  feature, 
  onUpgradeClick,
  children, 
  className,
  disabled,
  ...props 
}: PremiumButtonProps) => {
  const { hasFeature, getFeatureUpgradeMessage, getRequiredPlanForFeature } = useFeatureAccess();
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  
  const hasAccess = hasFeature(feature);
  const isDisabled = disabled || !hasAccess;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasAccess) {
      e.preventDefault();
      e.stopPropagation();
      
      toast.info('Función Premium', {
        description: getFeatureUpgradeMessage(feature),
        action: {
          label: 'Ver Planes',
          onClick: () => {
            navigate('/dashboard/configuracion?tab=suscripcion');
            onUpgradeClick?.();
          },
        },
        duration: 5000,
      });
      
      onUpgradeClick?.();
      return;
    }
    
    props.onClick?.(e);
  };

  return (
    <TooltipProvider>
      <Tooltip open={!hasAccess && showTooltip}>
        <TooltipTrigger asChild>
          <div 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="inline-flex"
          >
            <Button
              {...props}
              onClick={handleClick}
              disabled={isDisabled}
              className={cn(
                className,
                !hasAccess && "opacity-60 cursor-not-allowed relative"
              )}
            >
              {!hasAccess && <Lock className="mr-2 h-4 w-4" />}
              {children}
              {!hasAccess && (
                <Sparkles className="ml-2 h-3 w-3 text-yellow-500 absolute top-1 right-1" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        {!hasAccess && (
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="font-medium">
              {getFeatureUpgradeMessage(feature)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Requiere plan {getRequiredPlanForFeature(feature)}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
