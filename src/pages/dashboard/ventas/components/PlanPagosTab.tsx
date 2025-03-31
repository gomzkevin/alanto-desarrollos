
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Eye, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlanPagoDialog } from "./PlanPagoDialog";
import { PlanPago, PagoCalendarizado, usePlanPagos } from "@/hooks/usePlanPagos";
import { VentaWithDetail } from "@/hooks/ventaDetail/types";
import { Pago } from "@/hooks/usePagos";
import { Progress } from "@/components/ui/progress";

interface PlanPagosTabProps {
  venta: VentaWithDetail;
  compradorVentaId: string;
  pagos: Pago[];
  refetchPagos: () => void;
}

export const PlanPagosTab = ({ venta, compradorVentaId, pagos, refetchPagos }: PlanPagosTabProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  
  const { 
    planPagos, 
    isLoading, 
    generatePaymentSchedule,
    createPlanPagos,
    refetch
  } = usePlanPagos(compradorVentaId);
  
  const pagosProgramados = generatePaymentSchedule(planPagos, pagos);
  
  // Calculate payment statistics
  const totalPagos = pagosProgramados.reduce((sum, pago) => sum + pago.monto, 0);
  const pagosPendientes = pagosProgramados.filter(pago => pago.estado === 'pendiente');
  const pagosRealizados = pagosProgramados.filter(pago => pago.estado === 'pagado');
  const pagosAtrasados = pagosProgramados.filter(pago => pago.estado === 'atrasado');
  
  const montoPagado = pagosRealizados.reduce((sum, pago) => sum + pago.monto, 0);
  const montoPendiente = totalPagos - montoPagado;
  
  const progresoPagos = totalPagos > 0 ? (montoPagado / totalPagos) * 100 : 0;
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  };
  
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return <Badge variant="success">Pagado</Badge>;
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };
  
  // Find next payment
  const proximoPago = pagosPendientes.length > 0 
    ? pagosPendientes.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0]
    : null;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Cargando plan de pagos...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {!planPagos && (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="pt-6">
            <div className="text-center py-4 space-y-4">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/60" />
              <div className="space-y-2">
                <h3 className="font-medium text-lg">No hay plan de pagos definido</h3>
                <p className="text-muted-foreground text-sm">
                  Crea un plan de pagos para esta venta para visualizar el calendario de pagos.
                </p>
                <Button onClick={() => setOpenDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Crear Plan de Pagos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {planPagos && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="font-medium text-muted-foreground">Monto Total</h3>
                  <p className="text-3xl font-bold">{formatCurrency(totalPagos)}</p>
                  <div className="w-full pt-2">
                    <Progress value={progresoPagos} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">{progresoPagos.toFixed(0)}% completado</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="font-medium text-muted-foreground">Pagado / Pendiente</h3>
                  <div className="flex gap-2 items-baseline">
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(montoPagado)}</p>
                    <p className="text-lg text-muted-foreground">/ {formatCurrency(montoPendiente)}</p>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-xl font-semibold">{pagosRealizados.length}</p>
                      <p className="text-sm text-muted-foreground">Pagados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold">{pagosPendientes.length}</p>
                      <p className="text-sm text-muted-foreground">Pendientes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-red-500">{pagosAtrasados.length}</p>
                      <p className="text-sm text-muted-foreground">Atrasados</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="font-medium text-muted-foreground">Próximo Pago</h3>
                  {proximoPago ? (
                    <>
                      <p className="text-3xl font-bold">{formatCurrency(proximoPago.monto)}</p>
                      <p className="text-base font-medium">{formatDate(proximoPago.fecha)}</p>
                      <Badge variant="outline" className="mt-1">
                        {proximoPago.descripcion}
                      </Badge>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-muted-foreground">No hay pagos pendientes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Calendario de Pagos</CardTitle>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setOpenDialog(true)}
                className="h-8"
              >
                <Eye className="h-4 w-4 mr-1" /> Editar Plan
              </Button>
            </CardHeader>
            <CardContent>
              {pagosAtrasados.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Hay {pagosAtrasados.length} pago{pagosAtrasados.length !== 1 ? 's' : ''} atrasado{pagosAtrasados.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-red-600">
                      Total atrasado: {formatCurrency(pagosAtrasados.reduce((sum, pago) => sum + pago.monto, 0))}
                    </p>
                  </div>
                </div>
              )}
              
              {pagosProgramados.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No hay pagos programados en el plan
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">No.</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagosProgramados.map((pago) => (
                      <TableRow key={`${pago.numero}-${pago.fecha}`}>
                        <TableCell className="font-medium">{pago.numero}</TableCell>
                        <TableCell>{formatDate(pago.fecha)}</TableCell>
                        <TableCell>{pago.descripcion}</TableCell>
                        <TableCell>{formatCurrency(pago.monto)}</TableCell>
                        <TableCell>{getEstadoBadge(pago.estado)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
      
      <PlanPagoDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        venta={venta}
        existingPlan={planPagos}
        compradorVentaId={compradorVentaId}
        onSuccess={() => {
          refetch();
          refetchPagos();
        }}
      />
    </div>
  );
};

export default PlanPagosTab;
