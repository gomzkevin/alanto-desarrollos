
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVentas } from '@/hooks/useVentas';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { VentaProgress } from './VentaProgress';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VentasTableProps {
  refreshTrigger?: number;
}

export const VentasTable = ({ refreshTrigger = 0 }: VentasTableProps) => {
  const { ventas, isLoading, refetch } = useVentas();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_proceso':
        return <Badge variant="secondary">En Proceso</Badge>;
      case 'completada':
        return <Badge variant="success">Completada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const handleRowClick = (ventaId: string) => {
    navigate(`/dashboard/ventas/${ventaId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Cargando ventas...</p>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Alert variant="info" className="mb-6 max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Información sobre ventas</AlertTitle>
          <AlertDescription>
            Las ventas se crean automáticamente cuando:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>El estado de una unidad cambia a "apartado" o "en proceso"</li>
              <li>Se asigna un comprador a una unidad</li>
            </ul>
            Dirígete a la sección de <strong>Prototipos</strong>, selecciona un prototipo y cambia el estado de una unidad para crear tu primera venta.
          </AlertDescription>
        </Alert>
        <h3 className="text-xl font-semibold mb-2">No hay ventas registradas</h3>
        <p className="text-muted-foreground mb-4">
          Actualiza el estado de tus unidades para comenzar a dar seguimiento a tus ventas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="info" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Gestión automática de ventas</AlertTitle>
        <AlertDescription>
          Las ventas se crean y gestionan automáticamente a partir de los cambios en unidades. 
          Para añadir una venta, actualiza el estado de una unidad a "apartado" o "en proceso" desde la sección de Prototipos.
        </AlertDescription>
      </Alert>
    
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-medium">Desarrollo / Unidad</th>
                <th className="text-left p-4 font-medium">Tipo</th>
                <th className="text-left p-4 font-medium">Precio Total</th>
                <th className="text-left p-4 font-medium">Progreso</th>
                <th className="text-left p-4 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr 
                  key={venta.id} 
                  className="border-t hover:bg-muted/30 cursor-pointer"
                  onClick={() => handleRowClick(venta.id)}
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{venta.unidad?.prototipo?.desarrollo?.nombre || 'Desarrollo'}</p>
                      <p className="text-sm text-muted-foreground">
                        {venta.unidad?.prototipo?.nombre || 'Prototipo'} - Unidad {venta.unidad?.numero || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    {venta.es_fraccional ? (
                      <Badge variant="outline">Fraccional</Badge>
                    ) : (
                      <Badge variant="outline">Individual</Badge>
                    )}
                  </td>
                  <td className="p-4">{formatCurrency(venta.precio_total)}</td>
                  <td className="p-4 w-[200px]">
                    <VentaProgress 
                      progreso={venta.progreso || 0} 
                      montoTotal={venta.precio_total} 
                      montoPagado={(venta.precio_total * (venta.progreso || 0)) / 100}
                    />
                  </td>
                  <td className="p-4">{getEstadoBadge(venta.estado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VentasTable;
