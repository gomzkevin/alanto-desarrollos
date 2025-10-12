import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from "lucide-react";
import { FinancialWizardData } from "../../shared/types/wizard.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ExpensesStepProps {
  data: FinancialWizardData;
  errors: Record<string, string>;
  onChange: (field: keyof FinancialWizardData, value: any) => void;
}

const ExpenseField = ({
  id,
  label,
  tooltip,
  value,
  isPercentage,
  onValueChange,
  onToggleChange,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  tooltip: string;
  value: number | undefined;
  isPercentage: boolean;
  onValueChange: (val: number | undefined) => void;
  onToggleChange: (val: boolean) => void;
  error?: string;
  placeholder: string;
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor={id}>{label}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm", !isPercentage && "font-semibold text-primary")}>$</span>
            <Switch checked={isPercentage} onCheckedChange={onToggleChange} />
            <span className={cn("text-sm", isPercentage && "font-semibold text-primary")}>%</span>
          </div>
        </div>

        <Input
          id={id}
          type="number"
          min="0"
          step={isPercentage ? "1" : "0.01"}
          max={isPercentage ? "100" : undefined}
          placeholder={placeholder}
          value={value || ""}
          onChange={(e) => onValueChange(parseFloat(e.target.value) || undefined)}
          className={error ? "border-destructive" : ""}
        />

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export const ExpensesStep = ({ data, errors, onChange }: ExpensesStepProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Gastos e impuestos</h2>
        <p className="text-muted-foreground">
          Configura los costos operativos de tu desarrollo
        </p>
      </div>

      <ExpenseField
        id="mantenimiento"
        label="Mantenimiento"
        tooltip="Costo mensual o porcentaje sobre ingresos para mantenimiento de la propiedad"
        value={data.mantenimiento_valor}
        isPercentage={data.es_mantenimiento_porcentaje ?? true}
        onValueChange={(val) => onChange("mantenimiento_valor", val)}
        onToggleChange={(val) => onChange("es_mantenimiento_porcentaje", val)}
        error={errors.mantenimiento_valor}
        placeholder="5"
      />

      <ExpenseField
        id="gastos_fijos"
        label="Gastos fijos"
        tooltip="Gastos fijos mensuales (predial, seguro, etc.) o porcentaje sobre valor de la propiedad"
        value={data.gastos_fijos}
        isPercentage={data.es_gastos_fijos_porcentaje ?? false}
        onValueChange={(val) => onChange("gastos_fijos", val)}
        onToggleChange={(val) => onChange("es_gastos_fijos_porcentaje", val)}
        error={errors.gastos_fijos}
        placeholder="2500"
      />

      <ExpenseField
        id="gastos_variables"
        label="Gastos variables"
        tooltip="Gastos que varían con la ocupación (agua, luz, etc.) como porcentaje de ingresos"
        value={data.gastos_variables}
        isPercentage={data.es_gastos_variables_porcentaje ?? true}
        onValueChange={(val) => onChange("gastos_variables", val)}
        onToggleChange={(val) => onChange("es_gastos_variables_porcentaje", val)}
        error={errors.gastos_variables}
        placeholder="12"
      />

      <ExpenseField
        id="impuestos"
        label="Impuestos"
        tooltip="Impuestos sobre ingresos (ISR, etc.) como porcentaje"
        value={data.impuestos}
        isPercentage={data.es_impuestos_porcentaje ?? true}
        onValueChange={(val) => onChange("impuestos", val)}
        onToggleChange={(val) => onChange("es_impuestos_porcentaje", val)}
        error={errors.impuestos}
        placeholder="35"
      />

      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> Todos estos campos son opcionales. Si no tienes los datos exactos ahora, 
          puedes dejarlos en blanco y actualizarlos más tarde.
        </p>
      </Card>
    </div>
  );
};
