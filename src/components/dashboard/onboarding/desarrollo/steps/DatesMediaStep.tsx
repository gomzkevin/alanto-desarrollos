import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, Calendar, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { DesarrolloWizardData } from "../../shared/types/wizard.types";
import ImageUploader from "@/components/dashboard/ImageUploader";

interface DatesMediaStepProps {
  data: DesarrolloWizardData;
  errors: Record<string, string>;
  onChange: (field: keyof DesarrolloWizardData, value: any) => void;
}

export const DatesMediaStep = ({ data, errors, onChange }: DatesMediaStepProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Fechas y multimedia</h2>
        <p className="text-muted-foreground">
          Últimos detalles para completar tu desarrollo
        </p>
      </div>

      {/* Fechas */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Fechas del proyecto</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha inicio */}
          <div className="space-y-2">
            <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
            <Input
              id="fecha_inicio"
              type="date"
              value={data.fecha_inicio || ""}
              onChange={(e) => onChange("fecha_inicio", e.target.value)}
            />
          </div>

          {/* Fecha entrega */}
          <div className="space-y-2">
            <Label htmlFor="fecha_entrega">Fecha de entrega estimada</Label>
            <Input
              id="fecha_entrega"
              type="date"
              value={data.fecha_entrega || ""}
              onChange={(e) => onChange("fecha_entrega", e.target.value)}
              className={errors.fecha_entrega ? "border-destructive" : ""}
            />
            {errors.fecha_entrega && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.fecha_entrega}</span>
              </div>
            )}
          </div>
        </div>

        {data.fecha_inicio && data.fecha_entrega && !errors.fecha_entrega && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📅 Duración estimada del proyecto: {calculateMonthsDifference(data.fecha_inicio, data.fecha_entrega)} meses
            </p>
          </div>
        )}
      </Card>

      {/* Imagen */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Imagen principal</h3>
        </div>

        <ImageUploader
          currentImageUrl={data.imagen_url}
          onImageUploaded={(url) => onChange("imagen_url", url)}
          bucketName="desarrollo-images"
          entityId="temp-desarrollo"
          folderPath="desarrollos"
        />

        <p className="text-sm text-muted-foreground">
          Sube una imagen atractiva que represente tu desarrollo. Esta será la primera impresión para tus clientes.
        </p>
      </Card>

      {/* Resumen */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">¡Casi listo!</h3>
            <p className="text-sm text-muted-foreground">
              Tu desarrollo se creará con la información proporcionada. Podrás:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Agregar prototipos de unidades</li>
              <li>Gestionar inventario</li>
              <li>Configurar parámetros financieros cuando uses el módulo de Proyecciones</li>
              <li>Editar cualquier información más adelante</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

function calculateMonthsDifference(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth());
  return Math.max(0, months);
}
