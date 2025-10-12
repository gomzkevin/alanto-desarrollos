import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, DollarSign, Percent, TrendingUp } from "lucide-react";
import { FinancialWizardData } from "../../shared/types/wizard.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface BaseConfigStepProps {
  data: FinancialWizardData;
  errors: Record<string, string>;
  onChange: (field: keyof FinancialWizardData, value: any) => void;
}

export const BaseConfigStep = ({ data, errors, onChange }: BaseConfigStepProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Configuración financiera base</h2>
        <p className="text-muted-foreground">
          Parámetros principales para el cálculo de proyecciones
        </p>
      </div>

      {/* Moneda */}
      <Card className="p-6">
        <Label className="mb-4 block">
          Moneda <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            className={cn(
              "flex-1 p-6 rounded-lg border-2 transition-all",
              data.moneda === "MXN"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
            onClick={() => onChange("moneda", "MXN")}
          >
            <div className="text-4xl mb-2">🇲🇽</div>
            <div className="font-semibold">Peso Mexicano</div>
            <div className="text-muted-foreground text-sm">MXN</div>
          </button>

          <button
            type="button"
            className={cn(
              "flex-1 p-6 rounded-lg border-2 transition-all",
              data.moneda === "USD"
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-muted-foreground/30"
            )}
            onClick={() => onChange("moneda", "USD")}
          >
            <div className="text-4xl mb-2">🇺🇸</div>
            <div className="font-semibold">Dólar USD</div>
            <div className="text-muted-foreground text-sm">USD</div>
          </button>
        </div>
      </Card>

      {/* ADR Base */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="adr_base">
            ADR Base (Average Daily Rate) <span className="text-destructive">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Tarifa promedio diaria de renta. Ejemplo: $1,800 MXN por noche.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="adr_base"
            type="number"
            min="0"
            step="0.01"
            placeholder="1800"
            value={data.adr_base || ""}
            onChange={(e) => onChange("adr_base", parseFloat(e.target.value) || undefined)}
            className={cn("pl-9", errors.adr_base && "border-destructive")}
          />
        </div>
        {errors.adr_base && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.adr_base}</span>
          </div>
        )}
      </div>

      {/* Ocupación anual */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="ocupacion_anual">
            Ocupación anual estimada <span className="text-destructive">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Porcentaje de días del año que esperas tener ocupado. Ejemplo: 70%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="ocupacion_anual"
            type="number"
            min="0"
            max="100"
            placeholder="70"
            value={data.ocupacion_anual || ""}
            onChange={(e) => onChange("ocupacion_anual", parseInt(e.target.value) || undefined)}
            className={cn("pr-9", errors.ocupacion_anual && "border-destructive")}
          />
        </div>
        {errors.ocupacion_anual && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.ocupacion_anual}</span>
          </div>
        )}
      </div>

      {/* Comisión operador */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="comision_operador">
            Comisión del operador <span className="text-destructive">*</span>
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Comisión que cobra el operador de rentas vacacionales. Típicamente 15-25%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="comision_operador"
            type="number"
            min="0"
            max="100"
            placeholder="15"
            value={data.comision_operador || ""}
            onChange={(e) => onChange("comision_operador", parseInt(e.target.value) || undefined)}
            className={cn("px-9", errors.comision_operador && "border-destructive")}
          />
        </div>
        {errors.comision_operador && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.comision_operador}</span>
          </div>
        )}
      </div>

      {/* Preview de ingresos */}
      {data.adr_base && data.ocupacion_anual && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <p className="text-sm text-muted-foreground">
            📊 <strong>Ingreso bruto anual estimado:</strong>{" "}
            {new Intl.NumberFormat("es-MX", {
              style: "currency",
              currency: data.moneda || "MXN",
            }).format((data.adr_base * 365 * data.ocupacion_anual) / 100)}
          </p>
        </Card>
      )}
    </div>
  );
};
