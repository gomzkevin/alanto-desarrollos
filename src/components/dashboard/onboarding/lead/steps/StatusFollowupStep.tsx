import { LeadWizardData } from "../../shared/types/wizard.types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LEAD_STATUS_OPTIONS, LEAD_SUBSTATUS_OPTIONS } from "@/hooks/useLeads";
import useUsuarios from "@/hooks/useUsuarios";
import { cn } from "@/lib/utils";

interface StatusFollowupStepProps {
  data: LeadWizardData;
  errors: Record<string, string>;
  onChange: (field: keyof LeadWizardData, value: any) => void;
}

const getBadgeVariant = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'nuevo':
      return 'default';
    case 'seguimiento':
      return 'outline';
    case 'convertido':
      return 'secondary';
    case 'perdido':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const StatusFollowupStep = ({ data, errors, onChange }: StatusFollowupStepProps) => {
  const { usuarios } = useUsuarios();

  const substatusOptions = data.estado
    ? LEAD_SUBSTATUS_OPTIONS[data.estado as keyof typeof LEAD_SUBSTATUS_OPTIONS] || []
    : [];

  const selectedDate = data.ultimo_contacto ? new Date(data.ultimo_contacto) : new Date();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Estado y seguimiento</h2>
        <p className="text-muted-foreground">
          Clasifica el prospecto y programa el seguimiento
        </p>
      </div>

      <div className="space-y-6">
        {/* Estado */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">
            Estado del prospecto
            <span className="text-destructive ml-1">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {LEAD_STATUS_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange("estado", option.value);
                  // Reset subestado when estado changes
                  onChange("subestado", "");
                }}
                className={cn(
                  "flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all hover:scale-105",
                  data.estado === option.value
                    ? "border-indigo-600 bg-indigo-50 shadow-md"
                    : "border-border hover:border-indigo-300 bg-background"
                )}
              >
                <Badge variant={getBadgeVariant(option.value)} className="text-sm px-3 py-1">
                  {option.label}
                </Badge>
              </button>
            ))}
          </div>
          {errors.estado && (
            <p className="text-sm text-destructive">{errors.estado}</p>
          )}
        </div>

        {/* Subestado */}
        {data.estado && substatusOptions.length > 0 && (
          <div className="space-y-2 animate-in slide-in-from-top">
            <Label htmlFor="subestado" className="text-base">
              ¿En qué fase específica se encuentra?
            </Label>
            <Select value={data.subestado || ""} onValueChange={(value) => onChange("subestado", value)}>
              <SelectTrigger id="subestado" className="h-11">
                <SelectValue placeholder="Seleccionar fase (opcional)..." />
              </SelectTrigger>
              <SelectContent>
                {substatusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Agente */}
        <div className="space-y-2">
          <Label htmlFor="agente" className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4 text-indigo-600" />
            Agente asignado
          </Label>
          <Select value={data.agente || ""} onValueChange={(value) => onChange("agente", value)}>
            <SelectTrigger id="agente" className="h-11">
              <SelectValue placeholder="Auto-asignar (yo)" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No hay usuarios disponibles
                </div>
              ) : (
                usuarios.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.nombre || user.email}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Si no seleccionas un agente, se asignará automáticamente a ti
          </p>
        </div>

        {/* Último contacto */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            ¿Cuándo fue el último contacto?
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-11",
                  !data.ultimo_contacto && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.ultimo_contacto ? (
                  format(selectedDate, "PPP", { locale: es })
                ) : (
                  <span>Hoy</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => onChange("ultimo_contacto", date?.toISOString())}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <Label htmlFor="notas" className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-indigo-600" />
            Notas adicionales
          </Label>
          <Textarea
            id="notas"
            placeholder="Escribe cualquier información relevante sobre este prospecto..."
            rows={5}
            className="resize-none"
            value={data.notas || ""}
            onChange={(e) => onChange("notas", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Este campo es opcional, pero puede ser muy útil para el seguimiento
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Consejo:</strong> Mantén actualizado el estado del prospecto y agrega notas 
          detalladas para facilitar el seguimiento y mejorar la comunicación con tu equipo.
        </p>
      </div>
    </div>
  );
};
