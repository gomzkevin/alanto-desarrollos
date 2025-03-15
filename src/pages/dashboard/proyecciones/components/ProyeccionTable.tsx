
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
            <TableHead className="text-left font-medium text-slate-700">RENTA VACACIONAL</TableHead>
            <TableHead className="text-left font-medium text-slate-700">BONOS US</TableHead>
            <TableHead className="text-left font-medium text-slate-700">DIFERENCIA</TableHead>
            <TableHead className="text-left font-medium text-slate-700">ROI ANUAL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.length > 0 ? (
            chartData.map((item) => (
              <TableRow key={item.year} className="border-b border-slate-100 hover:bg-slate-50">
                <TableCell>{`Año ${item.year}`}</TableCell>
                <TableCell>{formatCurrency(item.airbnbProfit)}</TableCell>
                <TableCell>{formatCurrency(item.alternativeInvestment)}</TableCell>
                <TableCell>{formatCurrency(item.difference)}</TableCell>
                <TableCell>{item.yearlyROI}%</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                Haz clic en "Crear Proyección" para generar el análisis.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
