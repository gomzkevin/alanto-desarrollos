
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Building2, Home, Users, Calendar, CreditCard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const VentaDetail = () => {
  const { ventaId } = useParams();
  const [activeTab, setActiveTab] = useState('info');

  // Datos de ejemplo - estos vendrían del hook useVentaDetail
  const venta = {
    id: ventaId,
    precio_total: 1500000,
    progreso: 30,
    estado: 'en_proceso',
    es_fraccional: false,
    fecha_inicio: '2023-10-15',
    unidad: {
      numero: 'A101',
      desarrollo: 'Costa Azul',
      prototipo: 'Suite Premium'
    },
    compradores: [
      {
        id: '1',
        nombre: 'Juan Pérez',
        porcentaje: 100,
        pagos_realizados: 3,
        total_pagos: 12
      }
    ]
  };

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
            <Button variant="outline">Registrar Pago</Button>
            <Button variant="outline">Editar Venta</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Información de la Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID de Venta</p>
                  <p className="font-medium">{ventaId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium capitalize">{venta.estado.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                  <p className="font-medium">{venta.fecha_inicio}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Venta</p>
                  <p className="font-medium">{venta.es_fraccional ? 'Fraccional' : 'Individual'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Precio Total</p>
                  <p className="font-medium">${venta.precio_total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progreso de Pago</p>
                  <div className="flex items-center gap-2">
                    <Progress value={venta.progreso} className="flex-1" />
                    <span className="text-sm">{venta.progreso}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Información de la Unidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Building2 className="h-10 w-10 text-slate-400" />
                <div>
                  <p className="font-medium">{venta.unidad.desarrollo}</p>
                  <p className="text-sm text-muted-foreground">Desarrollo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Home className="h-10 w-10 text-slate-400" />
                <div>
                  <p className="font-medium">{venta.unidad.prototipo}</p>
                  <p className="text-sm text-muted-foreground">Prototipo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center font-medium text-slate-700">
                  {venta.unidad.numero}
                </div>
                <div>
                  <p className="font-medium">Unidad {venta.unidad.numero}</p>
                  <p className="text-sm text-muted-foreground">Número de unidad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Compradores</TabsTrigger>
            <TabsTrigger value="pagos">Plan de Pagos</TabsTrigger>
            <TabsTrigger value="historial">Historial de Pagos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compradores</CardTitle>
              </CardHeader>
              <CardContent>
                {venta.compradores.map(comprador => (
                  <div key={comprador.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-slate-400" />
                      <div>
                        <p className="font-medium">{comprador.nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          Porcentaje: {comprador.porcentaje}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{comprador.pagos_realizados} / {comprador.total_pagos}</p>
                      <p className="text-sm text-muted-foreground">Pagos realizados</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="pagos" className="space-y-4">
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
          
          <TabsContent value="historial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40 text-slate-500">
                  Historial de pagos (próximamente)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default VentaDetail;
