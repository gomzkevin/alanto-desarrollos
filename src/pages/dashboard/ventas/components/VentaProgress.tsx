
import { Progress } from "@/components/ui/progress";
import { VentaBasica } from '@/hooks/useVentas';

interface VentaProgressProps {
  venta: VentaBasica;
}

const VentaProgress = ({ venta }: VentaProgressProps) => {
  // Redondear al entero más cercano
  const progressValue = Math.round(venta.progreso || 0);
  
  // Determinar color basado en el progreso
  const getProgressColor = () => {
    if (progressValue < 25) return "bg-red-500";
    if (progressValue < 50) return "bg-amber-500";
    if (progressValue < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="rounded-lg border p-4 bg-card shadow-sm">
      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="font-medium">Progreso de Pagos</h3>
          <span className="font-semibold">{progressValue}%</span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-3" 
          indicatorClassName={getProgressColor()}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default VentaProgress;
