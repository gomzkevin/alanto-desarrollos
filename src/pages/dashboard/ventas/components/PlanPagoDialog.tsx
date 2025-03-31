
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { usePlanPagos, PlanPago } from "@/hooks/usePlanPagos";
import { VentaWithDetail } from "@/hooks/ventaDetail/types";

interface PlanPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaWithDetail;
  existingPlan: PlanPago | null;
  compradorVentaId: string;
  onSuccess: () => void;
}

export const PlanPagoDialog = ({ 
  open, 
  onOpenChange, 
  venta, 
  existingPlan, 
  compradorVentaId, 
  onSuccess 
}: PlanPagoDialogProps) => {
  const [montoTotal, setMontoTotal] = useState<number>(venta.precio_total || 0);
  const [anticipo, setAnticipo] = useState<number>(0);
  const [fechaAnticipo, setFechaAnticipo] = useState<Date>(new Date());
  const [plazoMeses, setPlazoMeses] = useState<number>(12);
  const [montoMensual, setMontoMensual] = useState<number>(0);
  const [diaPago, setDiaPago] = useState<number>(15);
  const [incluirFiniquito, setIncluirFiniquito] = useState<boolean>(false);
  const [montoFiniquito, setMontoFiniquito] = useState<number>(0);
  const [fechaFiniquito, setFechaFiniquito] = useState<Date>(new Date());
  
  const { createPlanPagos, updatePlanPagos, isCreating, isUpdating } = usePlanPagos();
  
  // Initialize form with existing plan or default values
  useEffect(() => {
    if (existingPlan) {
      setMontoTotal(existingPlan.monto_total);
      setAnticipo(existingPlan.anticipo || 0);
      if (existingPlan.fecha_anticipo) {
        setFechaAnticipo(new Date(existingPlan.fecha_anticipo));
      }
      setPlazoMeses(existingPlan.plazo_meses);
      setMontoMensual(existingPlan.monto_mensual);
      setDiaPago(existingPlan.dia_pago || 15);
      setIncluirFiniquito(existingPlan.incluye_finiquito);
      setMontoFiniquito(existingPlan.monto_finiquito || 0);
      if (existingPlan.fecha_finiquito) {
        setFechaFiniquito(new Date(existingPlan.fecha_finiquito));
      }
    } else {
      // Set default values based on venta
      setMontoTotal(venta.precio_total || 0);
      // Default anticipo and plazo
      setAnticipo(Math.round(venta.precio_total * 0.30)); // 30% anticipo por defecto
      setPlazoMeses(12); // 12 meses por defecto
      
      // Calculate monthly payment
      const totalSinAnticipo = venta.precio_total - (Math.round(venta.precio_total * 0.30));
      setMontoMensual(Math.round(totalSinAnticipo / 12));
      
      // Set default finiquito date to one year from now
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      setFechaFiniquito(oneYearFromNow);
    }
  }, [existingPlan, venta]);
  
  // Recalculate monthly payment when related values change
  useEffect(() => {
    if (montoTotal > 0 && plazoMeses > 0) {
      const montoSinAnticipo = montoTotal - anticipo;
      const montoSinFiniquito = incluirFiniquito ? montoSinAnticipo - montoFiniquito : montoSinAnticipo;
      
      if (montoSinFiniquito > 0 && plazoMeses > 0) {
        const calculatedMonthly = Math.round(montoSinFiniquito / plazoMeses);
        setMontoMensual(calculatedMonthly);
      }
    }
  }, [montoTotal, anticipo, plazoMeses, incluirFiniquito, montoFiniquito]);
  
  const handleSave = async () => {
    const planData = {
      comprador_venta_id: compradorVentaId,
      monto_total: montoTotal,
      plazo_meses: plazoMeses,
      monto_mensual: montoMensual,
      dia_pago: diaPago,
      anticipo: anticipo,
      fecha_anticipo: fechaAnticipo.toISOString(),
      incluye_finiquito: incluirFiniquito,
      monto_finiquito: incluirFiniquito ? montoFiniquito : null,
      fecha_finiquito: incluirFiniquito ? fechaFiniquito.toISOString() : null
    };
    
    try {
      if (existingPlan) {
        await updatePlanPagos(existingPlan.id, planData);
      } else {
        await createPlanPagos(planData);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar plan de pagos:', error);
    }
  };
  
  // Calculate totals for summary
  const totalPagos = anticipo + (montoMensual * plazoMeses) + (incluirFiniquito ? montoFiniquito : 0);
  const totalMensualidades = montoMensual * plazoMeses;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingPlan ? 'Editar Plan de Pagos' : 'Crear Plan de Pagos'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto Total</Label>
              <Input
                type="number"
                formatCurrency
                value={montoTotal}
                onChange={(e) => setMontoTotal(Number(e.target.value))}
                disabled
              />
              <p className="text-xs text-muted-foreground">Precio total de la venta</p>
            </div>
            
            <div className="space-y-2">
              <Label>Plazo (meses)</Label>
              <Input
                type="number"
                value={plazoMeses}
                onChange={(e) => setPlazoMeses(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Anticipo</Label>
            </div>
            <Input
              type="number"
              formatCurrency
              value={anticipo}
              onChange={(e) => setAnticipo(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Fecha de Anticipo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fechaAnticipo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaAnticipo ? format(fechaAnticipo, "PP") : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fechaAnticipo}
                  onSelect={(date) => date && setFechaAnticipo(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Monto Mensual</Label>
              <Input
                type="number"
                formatCurrency
                value={montoMensual}
                onChange={(e) => setMontoMensual(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Día de Pago</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={diaPago}
                onChange={(e) => setDiaPago(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Día del mes para pagos recurrentes</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="incluir-finiquito"
                checked={incluirFiniquito}
                onCheckedChange={setIncluirFiniquito}
              />
              <Label htmlFor="incluir-finiquito">Incluir Finiquito</Label>
            </div>
            
            {incluirFiniquito && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label>Monto Finiquito</Label>
                  <Input
                    type="number"
                    formatCurrency
                    value={montoFiniquito}
                    onChange={(e) => setMontoFiniquito(Number(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Fecha de Finiquito</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaFiniquito && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaFiniquito ? format(fechaFiniquito, "PP") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaFiniquito}
                        onSelect={(date) => date && setFechaFiniquito(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          
          <div className="border rounded-md bg-muted/40 p-4">
            <h3 className="font-medium mb-2">Resumen del Plan</h3>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <span>Anticipo:</span>
              <span className="text-right">{formatCurrency(anticipo)}</span>
              
              <span>Mensualidades:</span>
              <span className="text-right">{plazoMeses} x {formatCurrency(montoMensual)}</span>
              
              <span>Total Mensualidades:</span>
              <span className="text-right">{formatCurrency(totalMensualidades)}</span>
              
              {incluirFiniquito && (
                <>
                  <span>Finiquito:</span>
                  <span className="text-right">{formatCurrency(montoFiniquito)}</span>
                </>
              )}
              
              <span className="font-medium border-t mt-1 pt-1">Total Plan:</span>
              <span className="text-right font-medium border-t mt-1 pt-1">{formatCurrency(totalPagos)}</span>
            </div>
            
            {Math.abs(totalPagos - montoTotal) > 1 && (
              <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <p>El total del plan ({formatCurrency(totalPagos)}) no coincide con el precio de venta ({formatCurrency(montoTotal)}). 
                Ajusta los valores para que coincidan.</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Guardando...' : 'Guardar Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanPagoDialog;
