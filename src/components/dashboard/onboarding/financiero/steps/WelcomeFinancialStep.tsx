import { DollarSign, TrendingUp, Calculator } from "lucide-react";

interface WelcomeFinancialStepProps {
  desarrolloNombre?: string;
}

export const WelcomeFinancialStep = ({ desarrolloNombre }: WelcomeFinancialStepProps) => {
  return (
    <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
      {/* Icono principal */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Calculator className="h-10 w-10 text-primary" />
      </div>

      {/* Título y descripción */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">
          Configura los parámetros financieros
        </h1>
        {desarrolloNombre && (
          <p className="text-xl text-primary font-semibold">
            {desarrolloNombre}
          </p>
        )}
        <p className="text-lg text-muted-foreground">
          Para calcular proyecciones precisas, necesitamos algunos datos financieros de tu desarrollo.
        </p>
      </div>

      {/* Por qué es importante */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
        <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Ingresos</h3>
          <p className="text-sm text-muted-foreground">Estima tus ingresos potenciales</p>
        </div>

        <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">ROI</h3>
          <p className="text-sm text-muted-foreground">Calcula el retorno de inversión</p>
        </div>

        <div className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-muted/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold">Proyecciones</h3>
          <p className="text-sm text-muted-foreground">Visualiza escenarios futuros</p>
        </div>
      </div>

      {/* Nota */}
      <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Solo tomará 1-2 minutos.</strong> Estos datos se pueden actualizar en cualquier momento.
        </p>
      </div>
    </div>
  );
};
