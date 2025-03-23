
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ProyeccionChart } from './ProyeccionChart';

export interface ProyeccionResultsProps {
  resultData: any;
}

export const ProyeccionResults: React.FC<ProyeccionResultsProps> = ({ resultData }) => {
  // For demonstration, we'll use a simple chart
  const chartData = resultData?.monthlyProjection || [];

  return (
    <Card className="border-2 border-slate-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-white pb-2">
        <CardTitle className="text-lg font-semibold text-blue-800">
          Resultados de Proyección
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ProyeccionChart data={chartData} />
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-500 font-medium">Inversión Total</p>
            <p className="text-2xl font-bold text-blue-800">
              ${resultData?.totalInvestment?.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-500 font-medium">Utilidad Proyectada</p>
            <p className="text-2xl font-bold text-green-800">
              ${resultData?.projectedProfit?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
