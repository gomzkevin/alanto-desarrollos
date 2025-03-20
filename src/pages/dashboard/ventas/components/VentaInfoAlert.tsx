
import React from 'react';
import { InfoIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface VentaInfoAlertProps {
  className?: string;
}

export const VentaInfoAlert: React.FC<VentaInfoAlertProps> = ({ className }) => {
  return (
    <Alert 
      variant="default" 
      className={cn("border-blue-200 bg-blue-50", className)}
    >
      <InfoIcon className="h-4 w-4 text-blue-500" />
      <AlertTitle>Gestión automática de ventas</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Las ventas se crean automáticamente cuando se cambia el estado de una unidad a "apartado" o "en proceso".
        </p>
        <p>
          Para registrar pagos, primero debes asignar un comprador a la unidad desde la sección de Prototipos, y luego acceder 
          a esta venta para gestionar sus pagos y detalles adicionales.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default VentaInfoAlert;
