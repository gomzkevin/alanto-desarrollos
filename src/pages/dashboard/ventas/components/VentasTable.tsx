
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVentas } from '@/hooks/useVentas';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { VentaProgress } from './VentaProgress';

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
        <h3 className="text-xl font-semibold mb-2">No hay ventas registradas</h3>
        <p className="text-muted-foreground mb-4">
          Crea tu primera venta para comenzar a dar seguimiento a tus transacciones
        </p>
      </div>
    );
  }

  return (
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
  );
};

export default VentasTable;
