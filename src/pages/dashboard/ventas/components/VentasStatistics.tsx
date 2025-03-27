import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircleDollarSign, Home, ListChecks } from 'lucide-react';
import useVentas from '@/hooks/useVentas';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useState } from "react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";

const VentasStatistics = () => {
  const { ventas, isLoading } = useVentas();
  const [chartData, setChartData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [proximosPagos, setProximosPagos] = useState([]);
  const [pagosRetrasados, setPagosRetrasados] = useState([]);

  useEffect(() => {
    if (!ventas.length) return;

    // Prepare monthly revenue data
    const monthsData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize with all months
    for (let i = 0; i < 12; i++) {
      monthsData[i] = {
        month: i,
        name: format(new Date(currentYear, i, 1), 'MMMM', { locale: es }),
        "Ingresos": 0
      };
    }
    
    // Populate with actual data
    ventas.forEach(venta => {
      if (!venta.fecha_inicio) return;
      
      try {
        const date = parseISO(venta.fecha_inicio);
        if (date.getFullYear() === currentYear) {
          const month = date.getMonth();
          monthsData[month]["Ingresos"] += venta.precio_total || 0;
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    });
    
    setChartData(Object.values(monthsData));
    
    // Prepare distribution data
    const distribution = [
      { name: "Individual", value: 0 },
      { name: "Fraccional", value: 0 }
    ];
    
    ventas.forEach(venta => {
      if (venta.es_fraccional) {
        distribution[1].value += 1;
      } else {
        distribution[0].value += 1;
      }
    });
    
    setDistributionData(distribution);
  }, [ventas]);

  // Fetch pagos for all ventas
  useEffect(() => {
    const fetchAllPagos = async () => {
      if (!ventas.length) return;
      
      const proximos = [];
      const retrasados = [];
      
      for (const venta of ventas) {
        try {
          const { pagos } = await useVentaDetail(venta.id);
          
          if (pagos && pagos.length) {
            const today = new Date();
            
            pagos.forEach(pago => {
              if (!pago.fecha) return;
              
              const pagoDate = parseISO(pago.fecha);
              const isOverdue = isBefore(pagoDate, today) && pago.estado !== 'registrado';
              const isUpcoming = isAfter(pagoDate, today) && pago.estado !== 'registrado';
              
              const pagoItem = {
                id: pago.id,
                desarrollo: venta.unidad?.prototipo?.desarrollo?.nombre,
                unidad: `${venta.unidad?.prototipo?.nombre} - ${venta.unidad?.numero}`,
                monto: pago.monto,
                fecha: pago.fecha
              };
              
              if (isOverdue) {
                retrasados.push(pagoItem);
              } else if (isUpcoming) {
                proximos.push(pagoItem);
              }
            });
          }
        } catch (error) {
          console.error("Error fetching pagos for venta:", venta.id, error);
        }
      }
      
      // Sort by date
      proximos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      retrasados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Most overdue first
      
      setProximosPagos(proximos.slice(0, 5)); // Just take the first 5
      setPagosRetrasados(retrasados.slice(0, 5)); // Just take the first 5
    };
    
    fetchAllPagos();
  }, [ventas]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Cargando datos...</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              {proximosPagos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 font-medium">Desarrollo / Unidad</th>
                        <th className="text-left p-2 font-medium">Monto</th>
                        <th className="text-left p-2 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proximosPagos.map((pago) => (
                        <tr key={pago.id} className="border-t">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{pago.desarrollo || 'Desarrollo'}</p>
                              <p className="text-sm text-muted-foreground">{pago.unidad || 'Unidad'}</p>
                            </div>
                          </td>
                          <td className="p-2">{formatCurrency(pago.monto)}</td>
                          <td className="p-2">{format(parseISO(pago.fecha), 'dd/MM/yyyy')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500">
                  No hay próximos pagos programados
                </div>
              )}
            </TabsContent>
            <TabsContent value="retrasados" className="pt-4">
              {pagosRetrasados.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 font-medium">Desarrollo / Unidad</th>
                        <th className="text-left p-2 font-medium">Monto</th>
                        <th className="text-left p-2 font-medium">Vencimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagosRetrasados.map((pago) => (
                        <tr key={pago.id} className="border-t">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{pago.desarrollo || 'Desarrollo'}</p>
                              <p className="text-sm text-muted-foreground">{pago.unidad || 'Unidad'}</p>
                            </div>
                          </td>
                          <td className="p-2">{formatCurrency(pago.monto)}</td>
                          <td className="p-2">{format(parseISO(pago.fecha), 'dd/MM/yyyy')}</td>
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
      
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {chartData.length > 0 ? (
            <div className="h-[300px]">
              <BarChart
                data={chartData}
                index="name"
                categories={["Ingresos"]}
                colors={["indigo"]}
                valueFormatter={(value) => formatCurrency(value)}
                yAxisWidth={80}
              />
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No hay datos de ingresos para mostrar
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribución de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {distributionData.length > 0 && distributionData.some(item => item.value > 0) ? (
            <div className="h-[300px]">
              <LineChart
                data={distributionData}
                index="name"
                categories={["value"]}
                colors={["emerald"]}
                valueFormatter={(value) => `${value} ventas`}
                showYAxis={false}
                showLegend={false}
              />
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              No hay datos de distribución para mostrar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VentasStatistics;
