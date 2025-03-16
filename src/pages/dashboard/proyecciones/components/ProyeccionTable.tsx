
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface ProyeccionTableProps {
  chartData: any[];
}

export const ProyeccionTable = ({ chartData }: ProyeccionTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="text-left font-medium text-slate-700">AÑO</TableHead>
            <TableHead className="text-right font-medium text-slate-700">RENTA VACACIONAL</TableHead>
            <TableHead className="text-right font-medium text-slate-700">BONOS US</TableHead>
            <TableHead className="text-right font-medium text-slate-700">DIFERENCIA</TableHead>
            <TableHead className="text-right font-medium text-slate-700">ROI ANUAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <TableRow key={item.year} className="border-b border-slate-100 hover:bg-slate-50">
                <TableCell>Año {item.year}</TableCell>
                <TableCell className="text-right font-medium text-indigo-700">
                  {formatCurrency(item["Renta vacacional"] || item.airbnbProfit)}
                </TableCell>
                <TableCell className="text-right font-medium text-emerald-600">
                  {formatCurrency(item["Bonos US"] || item.alternativeInvestment)}
                </TableCell>
                <TableCell className="text-right font-medium text-purple-700">
                  {formatCurrency(item.difference)}
                </TableCell>
                <TableCell className="text-right font-medium text-amber-600">{item.yearlyROI}%</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                Configura los parámetros y haz clic en "Actualizar Proyección" para generar el análisis.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
