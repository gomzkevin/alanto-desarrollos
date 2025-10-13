import { LeadWizardData } from "../../shared/types/wizard.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Phone, Info } from "lucide-react";

interface ContactInfoStepProps {
  data: LeadWizardData;
  errors: Record<string, string>;
  onChange: (field: keyof LeadWizardData, value: any) => void;
}

export const ContactInfoStep = ({ data, errors, onChange }: ContactInfoStepProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Información del prospecto</h2>
        <p className="text-muted-foreground">
          Captura los datos de contacto básicos del prospecto
        </p>
      </div>

      <div className="space-y-6">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Nombre completo del prospecto
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombre"
            placeholder="Ej: Juan Pérez García"
            className="text-base h-12"
            value={data.nombre || ""}
            onChange={(e) => onChange("nombre", e.target.value)}
          />
          {errors.nombre && (
            <p className="text-sm text-destructive">{errors.nombre}</p>
          )}
        </div>

        {/* Email y Teléfono */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              className="h-11"
              value={data.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+52 55 1234 5678"
              className="h-11"
              value={data.telefono || ""}
              onChange={(e) => onChange("telefono", e.target.value)}
            />
          </div>
        </div>

        {errors.contact && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{errors.contact}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Ingresa al menos email o teléfono para poder contactar al prospecto.
            Ambos campos son opcionales, pero al menos uno es requerido.
          </AlertDescription>
        </Alert>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Consejo:</strong> Captura ambos datos de contacto cuando sea posible.
          Esto te permitirá tener múltiples canales para dar seguimiento al prospecto.
        </p>
      </div>
    </div>
  );
};
