
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertTriangle } from 'lucide-react';

interface VentaStatusBadgeProps {
  estado: string;
}

export const VentaStatusBadge = ({ estado }: VentaStatusBadgeProps) => {
  const statusConfig = {
    completada: {
      variant: 'success' as const,
      icon: <Check className="h-3.5 w-3.5 mr-1" />,
      label: 'Completada'
    },
    en_proceso: {
      variant: 'warning' as const,
      icon: <Clock className="h-3.5 w-3.5 mr-1" />,
      label: 'En proceso'
    },
    cancelada: {
      variant: 'destructive' as const,
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />,
      label: 'Cancelada'
    },
    default: {
      variant: 'outline' as const,
      icon: null,
      label: estado.replace('_', ' ')
    }
  };

  const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig.default;
  const formattedLabel = config.label || estado.replace('_', ' ');

  return (
    <Badge variant={config.variant} className="flex items-center">
      {config.icon}
      <span className="capitalize">{formattedLabel}</span>
    </Badge>
  );
};

export default VentaStatusBadge;
