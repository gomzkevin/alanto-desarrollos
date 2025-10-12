import { Building2, Clock, CheckCircle2 } from "lucide-react";

export const WelcomeStep = () => {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
      {/* Icono principal */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Building2 className="h-10 w-10 text-primary" />
      </div>

      {/* Título y descripción */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Crea tu nuevo desarrollo inmobiliario
        </h1>
        <p className="text-lg text-muted-foreground">
          Te guiaremos paso a paso para registrar tu desarrollo. Solo tomará 2-3 minutos.
        </p>
      </div>

      {/* Características del proceso */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
        <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">4 pasos sencillos</h3>
          <p className="text-sm text-muted-foreground">Proceso rápido e intuitivo</p>
        </div>

        <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Auto-guardado</h3>
          <p className="text-sm text-muted-foreground">Tu progreso se guarda automáticamente</p>
        </div>

        <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Información básica</h3>
          <p className="text-sm text-muted-foreground">Solo los datos esenciales</p>
        </div>
      </div>

      {/* Nota sobre configuración financiera */}
      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Nota:</strong> Los parámetros financieros se configurarán más tarde cuando uses el módulo de Proyecciones.
        </p>
      </div>
    </div>
  );
};
