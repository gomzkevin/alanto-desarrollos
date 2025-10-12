import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { DesarrolloWizardData } from "../../shared/types/wizard.types";

interface BasicInfoStepProps {
  data: DesarrolloWizardData;
  errors: Record<string, string>;
  onChange: (field: keyof DesarrolloWizardData, value: any) => void;
}

export const BasicInfoStep = ({ data, errors, onChange }: BasicInfoStepProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Información básica del desarrollo</h2>
        <p className="text-muted-foreground">
          Comencemos con los datos esenciales de tu proyecto
        </p>
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="nombre">
          Nombre del desarrollo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombre"
          placeholder="Ej: Residencial Vista Mar"
          value={data.nombre || ""}
          onChange={(e) => onChange("nombre", e.target.value)}
          className={errors.nombre ? "border-destructive" : ""}
        />
        {errors.nombre && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.nombre}</span>
          </div>
        )}
      </div>

      {/* Ubicación */}
      <div className="space-y-2">
        <Label htmlFor="ubicacion">
          Ubicación <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ubicacion"
          placeholder="Ej: Playa del Carmen, Quintana Roo"
          value={data.ubicacion || ""}
          onChange={(e) => onChange("ubicacion", e.target.value)}
          className={errors.ubicacion ? "border-destructive" : ""}
        />
        {errors.ubicacion && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.ubicacion}</span>
          </div>
        )}
      </div>

      {/* Total unidades */}
      <div className="space-y-2">
        <Label htmlFor="total_unidades">
          Total de unidades <span className="text-destructive">*</span>
        </Label>
        <Input
          id="total_unidades"
          type="number"
          min="1"
          placeholder="Ej: 50"
          value={data.total_unidades || ""}
          onChange={(e) => onChange("total_unidades", parseInt(e.target.value) || undefined)}
          className={errors.total_unidades ? "border-destructive" : ""}
        />
        {errors.total_unidades && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.total_unidades}</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Número total de unidades/departamentos en el desarrollo
        </p>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          placeholder="Describe brevemente las características principales del desarrollo..."
          value={data.descripcion || ""}
          onChange={(e) => onChange("descripcion", e.target.value)}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Una descripción atractiva ayudará a tus clientes a conocer mejor el proyecto
        </p>
      </div>
    </div>
  );
};
