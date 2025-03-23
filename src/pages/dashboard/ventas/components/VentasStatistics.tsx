
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VentasStatistics = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Ingresos Mensuales</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            Gráfico de ingresos por mes (próximamente)
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Distribución de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-slate-500">
            Gráfico de distribución (próximamente)
          </div>
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
              <div className="h-[200px] flex items-center justify-center text-slate-500">
                Tabla de próximos pagos programados (próximamente)
              </div>
            </TabsContent>
            <TabsContent value="retrasados" className="pt-4">
              <div className="h-[200px] flex items-center justify-center text-slate-500">
                Tabla de pagos retrasados (próximamente)
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VentasStatistics;
