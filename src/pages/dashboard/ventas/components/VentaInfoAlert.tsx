
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface VentaInfoAlertProps {
  className?: string;
}

export const VentaInfoAlert = ({ className = '' }: VentaInfoAlertProps) => {
  return (
    <Alert variant="info" className={className}>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Flujo de Ventas Automático</AlertTitle>
      <AlertDescription className="text-sm">
        <p className="mb-2">
          El sistema gestiona automáticamente las ventas basándose en los cambios de estado de las unidades:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Al cambiar una unidad a "apartado" o "en proceso", se crea una venta</li>
          <li>Al asignar un comprador a una unidad, se asocia automáticamente a la venta</li>
          <li>Los pagos registrados actualizan el progreso de la venta</li>
          <li>Cuando los pagos completan el precio total, la venta se marca como "completada"</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default VentaInfoAlert;
