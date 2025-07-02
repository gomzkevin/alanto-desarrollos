import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  description?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = "Algo salió mal",
  description = "Ha ocurrido un error inesperado. Por favor, intenta de nuevo."
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mb-4">
          {description}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2 text-xs">
              <summary>Error details (desarrollo)</summary>
              <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
            </details>
          )}
        </AlertDescription>
        <Button 
          onClick={resetError} 
          variant="outline" 
          size="sm"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Intentar de nuevo
        </Button>
      </Alert>
    </div>
  );
};

export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="Error de conexión"
    description="No se pudo conectar al servidor. Verifica tu conexión a internet e intenta de nuevo."
  />
);

export const DataErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="Error al cargar datos"
    description="No se pudieron cargar los datos solicitados. Por favor, intenta de nuevo."
  />
);