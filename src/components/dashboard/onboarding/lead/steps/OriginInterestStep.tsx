import { useState, useEffect } from "react";
import { LeadWizardData } from "../../shared/types/wizard.types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building, Home } from "lucide-react";
import useDesarrollos from "@/hooks/useDesarrollos";
import usePrototipos from "@/hooks/usePrototipos";
import { LEAD_ORIGIN_OPTIONS } from "@/hooks/useLeads";
import { cn } from "@/lib/utils";

interface OriginInterestStepProps {
  data: LeadWizardData;
  onChange: (field: keyof LeadWizardData, value: any) => void;
}

const getOriginIcon = (origin: string) => {
  switch (origin) {
    case 'sitio_web': return '🌐';
    case 'referido': return '🤝';
    case 'evento': return '🎪';
    case 'llamada': return '📞';
    case 'redes_sociales': return '📱';
    case 'whatsapp': return '💬';
    case 'portal_inmobiliario': return '🏢';
    case 'visita_fisica': return '🚶';
    case 'campaña_email': return '📧';
    default: return '❓';
  }
};

export const OriginInterestStep = ({ data, onChange }: OriginInterestStepProps) => {
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos();
  
  const [selectedDesarrollo, setSelectedDesarrollo] = useState<string>("");
  const [selectedPrototipo, setSelectedPrototipo] = useState<string>("");

  // Parse existing interes_en on mount
  useEffect(() => {
    if (data.interes_en) {
      if (data.interes_en.startsWith('desarrollo:')) {
        const desarrolloId = data.interes_en.split(':')[1];
        setSelectedDesarrollo(desarrolloId);
        setSelectedPrototipo("");
      } else if (data.interes_en.startsWith('prototipo:')) {
        const prototipoId = data.interes_en.split(':')[1];
        setSelectedPrototipo(prototipoId);
        const prototipo = prototipos.find(p => p.id === prototipoId);
        if (prototipo) {
          setSelectedDesarrollo(prototipo.desarrollo_id);
        }
      }
    }
  }, [data.interes_en, prototipos]);

  const handleDesarrolloChange = (desarrolloId: string) => {
    setSelectedDesarrollo(desarrolloId);
    setSelectedPrototipo(""); // Reset prototipo
    onChange("interes_en", `desarrollo:${desarrolloId}`);
  };

  const handlePrototipoChange = (prototipoId: string) => {
    setSelectedPrototipo(prototipoId);
    onChange("interes_en", `prototipo:${prototipoId}`);
  };

  const prototiposDelDesarrollo = selectedDesarrollo
    ? prototipos.filter(p => p.desarrollo_id === selectedDesarrollo)
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Origen e interés del prospecto</h2>
        <p className="text-muted-foreground">
          Registra cómo conociste al prospecto y qué le interesa
        </p>
      </div>

      {/* Origen */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">¿Cómo conociste a este prospecto?</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {LEAD_ORIGIN_OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange("origen", option.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105",
                data.origen === option.value
                  ? "border-indigo-600 bg-indigo-50 shadow-md"
                  : "border-border hover:border-indigo-300 bg-background"
              )}
            >
              <div className="text-3xl">{getOriginIcon(option.value)}</div>
              <span className="text-xs font-medium text-center leading-tight">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Interés */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold">¿En qué está interesado el prospecto?</Label>
        <p className="text-sm text-muted-foreground">
          Este campo es opcional. Selecciona un desarrollo o un prototipo específico si lo conoces.
        </p>

        {/* Selector de Desarrollo */}
        <div className="space-y-2">
          <Label htmlFor="desarrollo" className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            Desarrollo
          </Label>
          <Select value={selectedDesarrollo} onValueChange={handleDesarrolloChange}>
            <SelectTrigger id="desarrollo" className="h-12">
              <SelectValue placeholder="Seleccionar desarrollo (opcional)..." />
            </SelectTrigger>
            <SelectContent>
              {desarrollos.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No hay desarrollos disponibles
                </div>
              ) : (
                desarrollos.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {d.nombre}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Selector de Prototipo (condicional) */}
        {selectedDesarrollo && prototiposDelDesarrollo.length > 0 && (
          <div className="pl-4 border-l-2 border-indigo-200 space-y-2 animate-in slide-in-from-left">
            <Label htmlFor="prototipo" className="text-sm text-muted-foreground flex items-center gap-2">
              <Home className="w-4 h-4" />
              ¿Algún prototipo específico? (Opcional)
            </Label>
            <Select value={selectedPrototipo} onValueChange={handlePrototipoChange}>
              <SelectTrigger id="prototipo" className="h-11">
                <SelectValue placeholder="Sin prototipo específico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  <span className="text-muted-foreground">Sin prototipo específico</span>
                </SelectItem>
                {prototiposDelDesarrollo.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      <span>{p.nombre}</span>
                      {p.precio && (
                        <span className="text-xs text-muted-foreground">
                          ${p.precio.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Consejo:</strong> Conocer el origen y el interés del prospecto te ayudará a 
          personalizar tu estrategia de seguimiento y mejorar tus tasas de conversión.
        </p>
      </div>
    </div>
  );
};
