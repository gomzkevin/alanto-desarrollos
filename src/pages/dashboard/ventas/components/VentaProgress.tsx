
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface VentaProgressProps {
  progreso: number;
  montoTotal: number;
  montoPagado: number;
}

export const VentaProgress = ({ progreso, montoTotal, montoPagado }: VentaProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Progreso de pago</span>
        <span className="text-sm font-medium">{progreso}%</span>
      </div>
      <Progress value={progreso} className="h-2" />
      <div className="flex items-center justify-between text-sm">
        <span>{formatCurrency(montoPagado)}</span>
        <span className="text-muted-foreground">de {formatCurrency(montoTotal)}</span>
      </div>
    </div>
  );
};

export default VentaProgress;
