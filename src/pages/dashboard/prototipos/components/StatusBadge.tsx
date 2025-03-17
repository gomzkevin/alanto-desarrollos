
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  estado: string;
}

export const StatusBadge = ({ estado }: StatusBadgeProps) => {
  switch (estado) {
    case 'disponible':
      return <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>;
    case 'apartado':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Apartado</Badge>;
    case 'en_proceso':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">En Proceso</Badge>;
    case 'vendido':
      return <Badge className="bg-red-500 hover:bg-red-600">Vendido</Badge>;
    default:
      return <Badge>{estado}</Badge>;
  }
};

export default StatusBadge;
