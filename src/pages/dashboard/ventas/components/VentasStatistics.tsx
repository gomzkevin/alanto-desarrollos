
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVentasChartData } from "@/hooks/useVentasChartData";
import { BarChart, PieChart } from "@/components/ui/chart";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const VentasStatistics = () => {
  const { 
    monthlyIncomeData, 
    salesDistributionData, 
    upcomingPayments, 
    latePayments, 
    isLoading 
  } = useVentasChartData();

  // Value formatter for currency in charts
  const valueFormatter = (value: number) => formatCurrency(value);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ) : monthlyIncomeData.length > 0 ? (
            <BarChart
              className="h-[300px]"
              data={monthlyIncomeData}
              index="month"
              categories={["total"]}
              colors={["indigo"]}
              valueFormatter={valueFormatter}
              yAxisWidth={70}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No hay datos de ingresos disponibles
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribución de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-full rounded-full" />
            </div>
          ) : salesDistributionData.some(item => item.value > 0) ? (
            <PieChart
              className="h-[300px]"
              data={salesDistributionData}
              category="value"
              index="category"
              valueFormatter={valueFormatter}
              colors={salesDistributionData.map(d => d.color)}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No hay datos de ventas disponibles
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Proyección de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="proximos">
            <TabsList>
              <TabsTrigger value="proximos">Próximos Pagos</TabsTrigger>
              <TabsTrigger value="retrasados">Pagos Retrasados</TabsTrigger>
            </TabsList>
            <TabsContent value="proximos" className="pt-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : upcomingPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Fecha</th>
                        <th className="text-left py-3 px-2 font-medium">Desarrollo</th>
                        <th className="text-left py-3 px-2 font-medium">Unidad</th>
                        <th className="text-left py-3 px-2 font-medium">Comprador</th>
                        <th className="text-right py-3 px-2 font-medium">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-2">{formatDate(payment.fecha)}</td>
                          <td className="py-3 px-2">{payment.desarrollo}</td>
                          <td className="py-3 px-2">{payment.unidad}</td>
                          <td className="py-3 px-2">{payment.comprador}</td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(payment.monto)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500">
                  No hay pagos programados próximamente
                </div>
              )}
            </TabsContent>
            <TabsContent value="retrasados" className="pt-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : latePayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Fecha Vencida</th>
                        <th className="text-left py-3 px-2 font-medium">Desarrollo</th>
                        <th className="text-left py-3 px-2 font-medium">Unidad</th>
                        <th className="text-left py-3 px-2 font-medium">Comprador</th>
                        <th className="text-right py-3 px-2 font-medium">Monto</th>
                        <th className="text-right py-3 px-2 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latePayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/30">
                          <td className="py-3 px-2">{formatDate(payment.fecha)}</td>
                          <td className="py-3 px-2">{payment.desarrollo}</td>
                          <td className="py-3 px-2">{payment.unidad}</td>
                          <td className="py-3 px-2">{payment.comprador}</td>
                          <td className="py-3 px-2 text-right font-medium">{formatCurrency(payment.monto)}</td>
                          <td className="py-3 px-2 text-right">
                            <Badge variant="destructive">Retrasado</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500">
                  No hay pagos retrasados
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VentasStatistics;
