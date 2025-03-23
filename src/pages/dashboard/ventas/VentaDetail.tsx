
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Building2, Home, Calendar, CreditCard, Edit, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import useVentaDetail from '@/hooks/useVentaDetail';
import { InfoTab } from './components/InfoTab';
import { PagosTab } from './components/PagosTab';
import { VentaProgress } from './components/VentaProgress';
import { PagoDialog } from './components/PagoDialog';
import { VentaEditDialog } from './components/VentaEditDialog';
import { CompradorDialog } from './components/CompradorDialog';
import { VentaComprador } from '@/hooks/types';

interface InfoTabComprador {
  id: string;
  comprador_id: string;
  nombre: string;
  porcentaje: number;
  pagos_realizados?: number;
  total_pagos?: number;
}

const VentaDetail = () => {
  const { ventaId } = useParams<{ ventaId: string }>();
  const [activeTab, setActiveTab] = useState('info');
  const [openPagoDialog, setOpenPagoDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCompradorDialog, setOpenCompradorDialog] = useState(false);
  
  const { 
    venta, 
    compradores, 
    pagos,
    isLoading, 
    montoPagado,
    progreso,
    refetch,
    compradorVentaId
  } = useVentaDetail(ventaId);

  const formatCompradores = (compradores: VentaComprador[]): InfoTabComprador[] => {
    return compradores.map(c => ({
      id: c.id,
      comprador_id: c.comprador_id,
      nombre: c.comprador?.nombre || 'Sin nombre',
      porcentaje: c.porcentaje,
      pagos_realizados: pagos.filter(p => p.comprador_venta_id === c.id).length,
      total_pagos: 0
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Cargando información de la venta...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!venta) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="h-screen flex items-center justify-center">
            <p className="text-muted-foreground">No se encontró la venta solicitada</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const formattedCompradores = formatCompradores(compradores);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/ventas">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a ventas
            </Link>
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpenCompradorDialog(true)}
            >
              <Users className="mr-2 h-4 w-4" />
              Agregar Comprador
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpenPagoDialog(true)} 
              disabled={!compradorVentaId}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Información de la Venta</CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setOpenEditDialog(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID de Venta</p>
                  <p className="font-medium">{venta.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        venta.estado === 'completada' ? 'success' : 
                        venta.estado === 'en_proceso' ? 'warning' : 'default'
                      }
                    >
                      {venta.estado.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                  <p className="font-medium">{new Date(venta.fecha_inicio).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Venta</p>
                  <p className="font-medium">{venta.es_fraccional ? 'Fraccional' : 'Individual'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio Total</p>
                  <p className="font-medium">{formatCurrency(venta.precio_total)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última actualización</p>
                  <p className="font-medium">{new Date(venta.fecha_actualizacion).toLocaleDateString()}</p>
                </div>
              </div>
              
              <VentaProgress 
                progreso={progreso} 
                montoTotal={venta.precio_total} 
                montoPagado={montoPagado}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Información de la Unidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {venta.unidad && (
                <>
                  <div className="flex items-center gap-4">
                    <Building2 className="h-10 w-10 text-slate-400" />
                    <div>
                      <p className="font-medium">Desarrollo</p>
                      <p className="text-sm text-muted-foreground">Información del desarrollo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Home className="h-10 w-10 text-slate-400" />
                    <div>
                      <p className="font-medium">Prototipo</p>
                      <p className="text-sm text-muted-foreground">Información del prototipo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center font-medium text-slate-700">
                      {venta.unidad.numero || 'N/A'}
                    </div>
                    <div>
                      <p className="font-medium">Unidad {venta.unidad.numero || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">Número de unidad</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Compradores</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="plan">Plan de Pagos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <InfoTab 
              venta={venta} 
              compradores={formattedCompradores} 
              pagos={pagos}
              onAddComprador={() => setOpenCompradorDialog(true)}
            />
          </TabsContent>
          
          <TabsContent value="pagos" className="space-y-4">
            {compradores.length > 0 ? (
              <PagosTab 
                ventaId={venta.id} 
                compradorVentaId={compradorVentaId}
                pagos={pagos}
                isLoading={isLoading}
                refetchPagos={refetch}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4 text-muted-foreground">
                    No hay compradores asignados a esta venta. Debe asignar al menos un comprador para registrar pagos.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="plan" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 text-slate-500">
                  Información del plan de pagos (próximamente)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {compradorVentaId && (
          <PagoDialog
            open={openPagoDialog}
            onOpenChange={setOpenPagoDialog}
            compradorVentaId={compradorVentaId}
            onSuccess={refetch}
          />
        )}

        <VentaEditDialog
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          venta={venta}
          onSuccess={refetch}
        />

        <CompradorDialog 
          open={openCompradorDialog}
          onOpenChange={setOpenCompradorDialog}
          ventaId={venta.id}
          esVentaFraccional={venta.es_fraccional}
          onSuccess={refetch}
        />
      </div>
    </DashboardLayout>
  );
};

export default VentaDetail;
