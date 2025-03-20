
import { CreditCard, Building, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { VentaBasica } from '@/hooks/useVentas';

interface VentaHeaderProps {
  venta: VentaBasica;
}

const VentaHeader = ({ venta }: VentaHeaderProps) => {
  // Calcular el monto total pagado
  const montoPagado = venta.compradores?.reduce((sum, comprador) => {
    return sum + (comprador.total_pagado || 0);
  }, 0) || 0;

  // Formatear fecha de forma legible
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="rounded-lg border p-6 bg-card shadow-sm">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">
              Unidad {venta.unidad?.numero}
            </h1>
            {venta.es_fraccional && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                Venta Fraccional
              </Badge>
            )}
            <Badge variant="outline" className={
              venta.estado === 'completada' 
                ? 'bg-green-50 text-green-600 border-green-200' 
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }>
              {venta.estado === 'completada' ? 'Completada' : 'En Proceso'}
            </Badge>
          </div>
          
          <div className="flex items-center text-muted-foreground gap-4">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>
                {venta.unidad?.prototipo?.desarrollo?.nombre} - {venta.unidad?.prototipo?.nombre}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Iniciada el {formatFecha(venta.fecha_inicio)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Precio Total</p>
            <p className="text-2xl font-bold">{formatCurrency(venta.precio_total)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Pagado</p>
            <p className="text-xl font-semibold text-green-600">{formatCurrency(montoPagado)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Pendiente</p>
            <p className="text-xl font-semibold text-amber-600">
              {formatCurrency(venta.precio_total - montoPagado)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentaHeader;
