
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

interface ProyeccionTableProps {
  chartData: any[];
}

export const ProyeccionTable = ({ chartData }: ProyeccionTableProps) => {
  // Calcular valores adicionales para la tabla de proyección
  const processedData = chartData.map(item => {
    // Noche vendidas = 365 días * porcentaje de ocupación
    const ocupacion = item.occupancyRate || 74; // Valor por defecto o del ítem
    const nochesVendidas = Math.round(365 * (ocupacion / 100));
    
    // Precio promedio neto por noche
    const precioPromedio = item.nightlyRate || item.precioPromedio || 1800;
    
    // Ventas totales = noches vendidas * precio promedio
    const ventasTotales = nochesVendidas * precioPromedio;
    
    // Comisiones y gastos
    const comisionOperador = ventasTotales * (item.comisionOperador || 15) / 100;
    const gastosFijos = item.gastosFijos || 2500 * 12; // Anualizados
    const gastosVariables = ventasTotales * (item.gastosVariables || 12) / 100;
    const mantenimiento = (item.esMantenimientoPorcentaje ? 
      (item.initialPropertyValue * (item.mantenimientoValor || 5) / 100) : 
      (item.mantenimientoValor || 5000));
    
    // Total gastos
    const gastosTotales = comisionOperador + gastosFijos + gastosVariables + mantenimiento;
    
    // Utilidad antes de impuestos
    const utilidadAntesImpuestos = ventasTotales - gastosTotales;
    
    // Impuestos
    const impuestos = utilidadAntesImpuestos * (item.impuestos || 35) / 100;
    
    // Utilidad neta
    const utilidadNeta = utilidadAntesImpuestos - impuestos;
    
    // Margen de utilidad (%)
    const margenUtilidad = (utilidadNeta / ventasTotales) * 100;
    
    return {
      ...item,
      ocupacion: ocupacion,
      nochesVendidas,
      precioPromedio,
      ventasTotales,
      comisionOperador,
      gastosFijos,
      gastosVariables,
      mantenimiento,
      gastosTotales,
      utilidadAntesImpuestos,
      impuestos,
      utilidadNeta,
      margenUtilidad
    };
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-800 border-b border-slate-700">
            <TableHead className="text-left font-medium text-slate-200">AÑO</TableHead>
            <TableHead className="text-right font-medium text-slate-200">OCUPACIÓN</TableHead>
            <TableHead className="text-right font-medium text-slate-200">NOCHES VENDIDAS</TableHead>
            <TableHead className="text-right font-medium text-slate-200">PRECIO PROMEDIO</TableHead>
            <TableHead className="text-right font-medium text-slate-200">VENTAS TOTALES</TableHead>
            <TableHead className="text-right font-medium text-slate-200">COMISIONES Y GASTOS</TableHead>
            <TableHead className="text-right font-medium text-slate-200">UTILIDAD ANUAL NETA</TableHead>
            <TableHead className="text-right font-medium text-slate-200">MARGEN (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedData.length > 0 ? (
            processedData.map((item) => (
              <TableRow key={item.year} className={item.year % 2 === 0 ? 
                "border-b border-slate-200 bg-slate-50 hover:bg-slate-100" :
                "border-b border-slate-100 hover:bg-slate-50"}>
                <TableCell className="font-medium">Año {item.year}</TableCell>
                <TableCell className="text-right">{formatPercent(item.ocupacion)}</TableCell>
                <TableCell className="text-right">{formatNumber(item.nochesVendidas)}</TableCell>
                <TableCell className="text-right font-medium text-emerald-600">
                  {formatCurrency(item.precioPromedio)}
                </TableCell>
                <TableCell className="text-right font-semibold text-indigo-700">
                  {formatCurrency(item.ventasTotales)}
                </TableCell>
                <TableCell className="text-right font-medium text-amber-600">
                  {formatCurrency(item.gastosTotales)}
                </TableCell>
                <TableCell className="text-right font-bold text-purple-700">
                  {formatCurrency(item.utilidadNeta)}
                </TableCell>
                <TableCell className="text-right font-semibold text-blue-600">
                  {formatPercent(item.margenUtilidad)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4 text-slate-500">
                Configura los parámetros y haz clic en "Actualizar Proyección" para generar el análisis.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
