
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LEAD_ESTADOS } from '@/constants/leadEstados';

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

export const LeadStatusBadge: React.FC<LeadStatusBadgeProps> = ({ status, className }) => {
  const statusObj = LEAD_ESTADOS.find(s => s.value === status) || { value: 'desconocido', label: 'Desconocido', color: 'gray' };

  const getVariant = () => {
    switch (statusObj.color) {
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'red': return 'destructive';
      case 'blue': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Badge variant={getVariant() as any} className={className}>
      {statusObj.label}
    </Badge>
  );
};

export default LeadStatusBadge;
