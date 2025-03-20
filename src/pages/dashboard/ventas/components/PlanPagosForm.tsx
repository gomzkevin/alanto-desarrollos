
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/utils';
import { CompradoresVenta, PlanPago } from '@/hooks/useVentas';
import LoadingSpinner from '@/components/ui/spinner';

interface PlanPagosFormProps {
  comprador: CompradoresVenta;
  onSubmit: (planData: Omit<PlanPago, 'id' | 'created_at' | 'comprador_venta_id'>) => void;
  isLoading: boolean;
}

const PlanPagosForm = ({
  comprador,
  onSubmit,
  isLoading
}: PlanPagosFormProps) => {
  // Estado del formulario
  const [montoTotal, setMontoTotal] = useState(comprador.monto_comprometido);
  const [plazoMeses, setPlazoMeses] = useState(12);
  const [montoMensual, setMontoMensual] = useState(montoTotal / 12);
  const [diaPago, setDiaPago] = useState(1);
  const [anticipo, setAnticipo] = useState(0);
  const [fechaAnticipo, setFechaAnticipo] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [incluyeFiniquito, setIncluyeFiniquito] = useState(false);
  const [montoFiniquito, setMontoFiniquito] = useState(0);
  const [fechaFiniquito, setFechaFiniquito] = useState<string>('');
  
  // Inicializar con datos existentes
  useEffect(() => {
    if (comprador.plan_pago) {
      const plan = comprador.plan_pago;
      setMontoTotal(plan.monto_total || comprador.monto_comprometido);
      setPlazoMeses(plan.plazo_meses || 12);
      setMontoMensual(plan.monto_mensual || montoTotal / 12);
      setDiaPago(plan.dia_pago || 1);
      setAnticipo(plan.anticipo || 0);
      
      if (plan.fecha_anticipo) {
        setFechaAnticipo(new Date(plan.fecha_anticipo).toISOString().substring(0, 10));
      }
      
      setIncluyeFiniquito(plan.incluye_finiquito || false);
      setMontoFiniquito(plan.monto_finiquito || 0);
      
      if (plan.fecha_finiquito) {
        setFechaFiniquito(new Date(plan.fecha_finiquito).toISOString().substring(0, 10));
      }
    } else {
      // Valores por defecto
      setMontoTotal(comprador.monto_comprometido);
      setPlazoMeses(12);
      setMontoMensual(comprador.monto_comprometido / 12);
      setDiaPago(1);
      setAnticipo(0);
      setFechaAnticipo(new Date().toISOString().substring(0, 10));
      setIncluyeFiniquito(false);
      setMontoFiniquito(0);
      setFechaFiniquito('');
    }
  }, [comprador]);

  // Recalcular monto mensual cuando cambian los otros valores
  useEffect(() => {
    const totalSinAnticipo = montoTotal - anticipo;
    const totalSinFiniquito = incluyeFiniquito ? totalSinAnticipo - montoFiniquito : totalSinAnticipo;
    
    // Evitar división por cero
    if (plazoMeses > 0) {
      setMontoMensual(totalSinFiniquito / plazoMeses);
    } else {
      setMontoMensual(0);
    }
  }, [montoTotal, plazoMeses, anticipo, incluyeFiniquito, montoFiniquito]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear objeto de plan de pagos
    const planData: Omit<PlanPago, 'id' | 'created_at' | 'comprador_venta_id'> = {
      monto_total: montoTotal,
      plazo_meses: plazoMeses,
      monto_mensual: montoMensual,
      dia_pago: diaPago,
      anticipo: anticipo,
      fecha_anticipo: fechaAnticipo ? new Date(fechaAnticipo).toISOString() : null,
      incluye_finiquito: incluyeFiniquito,
      monto_finiquito: incluyeFiniquito ? montoFiniquito : null,
      fecha_finiquito: incluyeFiniquito && fechaFiniquito ? new Date(fechaFiniquito).toISOString() : null
    };
    
    onSubmit(planData);
  };

  // Helper para validar que el formato de fecha sea correcto
  const isValidDate = (dateString: string) => {
    if (!dateString) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  };

  // Validar formulario
  const isFormValid = () => {
    const isFechaAnticipoValid = isValidDate(fechaAnticipo);
    const isFechaFiniquitoValid = !incluyeFiniquito || (incluyeFiniquito && isValidDate(fechaFiniquito));
    
    return plazoMeses > 0 && diaPago > 0 && diaPago <= 31 && 
           isFechaAnticipoValid && isFechaFiniquitoValid;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="montoTotal">Monto Total</Label>
        <Input
          id="montoTotal"
          type="text"
          value={formatCurrency(montoTotal)}
          className="bg-muted/50"
          readOnly
        />
        <p className="text-xs text-muted-foreground">
          Este es el monto comprometido por el comprador
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="plazoMeses">Plazo (meses)</Label>
          <Input
            id="plazoMeses"
            type="number"
            min="1"
            value={plazoMeses}
            onChange={(e) => setPlazoMeses(parseInt(e.target.value) || 0)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="diaPago">Día de pago mensual</Label>
          <Input
            id="diaPago"
            type="number"
            min="1"
            max="31"
            value={diaPago}
            onChange={(e) => setDiaPago(parseInt(e.target.value) || 1)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="anticipo">Anticipo</Label>
          <Input
            id="anticipo"
            type="number"
            min="0"
            max={montoTotal}
            value={anticipo}
            onChange={(e) => setAnticipo(parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fechaAnticipo">Fecha de anticipo</Label>
          <Input
            id="fechaAnticipo"
            type="date"
            value={fechaAnticipo}
            onChange={(e) => setFechaAnticipo(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="incluyeFiniquito"
            checked={incluyeFiniquito}
            onCheckedChange={setIncluyeFiniquito}
          />
          <Label htmlFor="incluyeFiniquito">Incluye pago de finiquito</Label>
        </div>
        
        {incluyeFiniquito && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montoFiniquito">Monto finiquito</Label>
              <Input
                id="montoFiniquito"
                type="number"
                min="0"
                max={montoTotal - anticipo}
                value={montoFiniquito}
                onChange={(e) => setMontoFiniquito(parseFloat(e.target.value) || 0)}
                required={incluyeFiniquito}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fechaFiniquito">Fecha de finiquito</Label>
              <Input
                id="fechaFiniquito"
                type="date"
                value={fechaFiniquito}
                onChange={(e) => setFechaFiniquito(e.target.value)}
                required={incluyeFiniquito}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="space-y-2">
          <Label htmlFor="montoMensual">Pago mensual calculado</Label>
          <Input
            id="montoMensual"
            type="text"
            value={formatCurrency(montoMensual)}
            className="bg-muted/50"
            readOnly
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Guardando...
          </>
        ) : (
          'Guardar Plan de Pagos'
        )}
      </Button>
    </form>
  );
};

export default PlanPagosForm;
