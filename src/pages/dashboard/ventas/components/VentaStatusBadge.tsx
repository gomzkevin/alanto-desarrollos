
import { Badge } from "@/components/ui/badge";

type VentaStatusBadgeProps = {
  estado: string;
};

export const VentaStatusBadge = ({ estado }: VentaStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activa':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'pendiente':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'cancelada':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case 'finalizada':
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <Badge className={getStatusColor(estado)} variant="outline">
      {estado}
    </Badge>
  );
};

export default VentaStatusBadge;
