
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExtendedCotizacion } from '@/hooks/useCotizaciones';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CotizacionesStatsProps {
  cotizaciones: ExtendedCotizacion[];
  isLoading: boolean;
}

export const CotizacionesStats: React.FC<CotizacionesStatsProps> = ({ cotizaciones, isLoading }) => {
  const totalCotizaciones = cotizaciones.length;
  
  const totalMonto = cotizaciones.reduce((sum, cotizacion) => {
    return sum + (cotizacion.prototipo?.precio || 0);
  }, 0);
  
  const promedioMonto = totalCotizaciones > 0 ? totalMonto / totalCotizaciones : 0;
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cotizaciones</CardDescription>
            <Skeleton className="h-8 w-24 mt-1" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monto Total</CardDescription>
            <Skeleton className="h-8 w-32 mt-1" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Promedio por Cotización</CardDescription>
            <Skeleton className="h-8 w-28 mt-1" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Cotizaciones</CardDescription>
          <CardTitle className="text-3xl">{totalCotizaciones}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Monto Total</CardDescription>
          <CardTitle className="text-3xl">{formatCurrency(totalMonto)}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Promedio por Cotización</CardDescription>
          <CardTitle className="text-3xl">{formatCurrency(promedioMonto)}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default CotizacionesStats;
