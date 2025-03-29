
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface LeadStatusCardProps {
  estado: {
    value: string;
    label: string;
    color: string;
  };
  count: number;
  onFilter: (estado?: string) => void;
}

const LeadStatusCard: React.FC<LeadStatusCardProps> = ({ estado, count, onFilter }) => {
  const getIcon = () => {
    switch (estado.color) {
      case 'green':
        return <BadgeCheck className="h-6 w-6 text-green-500" />;
      case 'yellow':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'red':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'blue':
      default:
        return <AlertTriangle className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (estado.color) {
      case 'green':
        return 'bg-green-50 hover:bg-green-100';
      case 'yellow':
        return 'bg-yellow-50 hover:bg-yellow-100';
      case 'red':
        return 'bg-red-50 hover:bg-red-100';
      case 'blue':
      default:
        return 'bg-blue-50 hover:bg-blue-100';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors ${getBackgroundColor()}`}
      onClick={() => onFilter(estado.value === 'todos' ? undefined : estado.value)}
    >
      <CardContent className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {getIcon()}
          <span className="font-medium">{estado.label}</span>
        </div>
        <span className="text-2xl font-bold">{count}</span>
      </CardContent>
    </Card>
  );
};

export default LeadStatusCard;
