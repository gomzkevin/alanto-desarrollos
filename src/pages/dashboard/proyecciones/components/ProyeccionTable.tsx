
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface ProyeccionTableProps {
  tableData: any[];
}

export const ProyeccionTable: React.FC<ProyeccionTableProps> = ({ tableData }) => {
  return (
    <Card className="border-2 border-slate-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-2">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Detalle Mensual
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[100px]">Mes</TableHead>
                <TableHead>Ingresos</TableHead>
                <TableHead>Gastos</TableHead>
                <TableHead>Utilidad</TableHead>
                <TableHead>% Margen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData && tableData.map((row, index) => {
                const margin = row.income > 0 ? (row.profit / row.income) * 100 : 0;
                
                return (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell>${row.income.toLocaleString()}</TableCell>
                    <TableCell>${row.expenses.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-green-700">
                      ${row.profit.toLocaleString()}
                    </TableCell>
                    <TableCell>{margin.toFixed(1)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
