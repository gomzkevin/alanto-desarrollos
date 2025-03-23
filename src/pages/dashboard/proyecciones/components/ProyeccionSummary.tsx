
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, PiggyBank, DollarSign } from 'lucide-react';

interface ProyeccionSummaryProps {
  summaryData: {
    roi: number;
    returnPeriod: number;
    totalInvestment: number;
    projectedProfit: number;
  };
}

export const ProyeccionSummary: React.FC<ProyeccionSummaryProps> = ({ summaryData }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ROI</p>
              <p className="text-2xl font-bold">{summaryData.roi}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Periodo de Retorno</p>
              <p className="text-2xl font-bold">{summaryData.returnPeriod} meses</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <PiggyBank className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inversión Total</p>
              <p className="text-2xl font-bold">${summaryData.totalInvestment.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilidad Proyectada</p>
              <p className="text-2xl font-bold">${summaryData.projectedProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
