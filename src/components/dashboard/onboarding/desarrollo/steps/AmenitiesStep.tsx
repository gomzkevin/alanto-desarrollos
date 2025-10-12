import { DesarrolloWizardData } from "../../shared/types/wizard.types";
import { AmenitiesSelector } from "@/components/dashboard/AmenitiesSelector";

interface AmenitiesStepProps {
  data: DesarrolloWizardData;
  onChange: (field: keyof DesarrolloWizardData, value: any) => void;
}

export const AmenitiesStep = ({ data, onChange }: AmenitiesStepProps) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Características y amenidades</h2>
        <p className="text-muted-foreground">
          Selecciona todas las amenidades que ofrece tu desarrollo
        </p>
      </div>

      <AmenitiesSelector
        selectedAmenities={data.amenidades || []}
        onChange={(amenidades) => onChange("amenidades", amenidades)}
      />

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Consejo:</strong> Las amenidades son un factor clave en la decisión de compra. 
          Asegúrate de incluir todas las que apliquen para hacer tu desarrollo más atractivo.
        </p>
      </div>
    </div>
  );
};
