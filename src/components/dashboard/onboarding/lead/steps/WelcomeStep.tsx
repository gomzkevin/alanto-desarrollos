import { UserPlus, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export const WelcomeStep = () => {
  return (
    <div className="text-center py-12 space-y-8 max-w-2xl mx-auto">
      <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-lg">
        <UserPlus className="w-12 h-12 text-indigo-600" />
      </div>
      
      <div className="space-y-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Registra un nuevo prospecto
        </h2>
        <p className="text-muted-foreground text-lg">
          Te guiaremos paso a paso para registrar tu prospecto de manera rápida y completa.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-700">4 pasos simples</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-700">1-2 minutos</span>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span className="font-medium text-purple-700">Mejor seguimiento</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
        <h3 className="font-semibold text-lg mb-3 text-indigo-900">¿Qué vamos a capturar?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-indigo-600">1</span>
            </div>
            <div>
              <p className="font-medium text-sm text-indigo-900">Información de contacto</p>
              <p className="text-xs text-indigo-600">Nombre, email y teléfono</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-indigo-600">2</span>
            </div>
            <div>
              <p className="font-medium text-sm text-indigo-900">Origen e interés</p>
              <p className="text-xs text-indigo-600">¿Cómo llegó y qué le interesa?</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-indigo-600">3</span>
            </div>
            <div>
              <p className="font-medium text-sm text-indigo-900">Estado actual</p>
              <p className="text-xs text-indigo-600">Clasificación del prospecto</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-indigo-600">4</span>
            </div>
            <div>
              <p className="font-medium text-sm text-indigo-900">Notas de seguimiento</p>
              <p className="text-xs text-indigo-600">Información adicional relevante</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        💡 Puedes guardar tu progreso en cualquier momento usando el botón "Guardar borrador"
      </p>
    </div>
  );
};
