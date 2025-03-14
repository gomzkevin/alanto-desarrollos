
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import useUserRole from '@/hooks/useUserRole';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useCotizaciones, { ExtendedCotizacion } from '@/hooks/useCotizaciones';

const CotizacionesPage = () => {
  const { canCreateResource } = useUserRole();
  const [selectedCotizacion, setSelectedCotizacion] = useState<ExtendedCotizacion | null>(null);
  
  const { 
    cotizaciones, 
    isLoading, 
    error,
    refetch 
  } = useCotizaciones();

  const handleExportPDF = () => {
    alert('Exportar a PDF (función en desarrollo)');
  };
  
  const handleViewCotizacion = (cotizacion: ExtendedCotizacion) => {
    setSelectedCotizacion(cotizacion);
  };
  
  // Generate payment schedule based on cotizacion data
  const generatePaymentSchedule = (cotizacion: ExtendedCotizacion | null) => {
    if (!cotizacion || !cotizacion.prototipo) return [];
    
    const prototipo = cotizacion.prototipo;
    
    const totalPrice = prototipo.precio;
    const downPayment = cotizacion.monto_anticipo || 0;
    const numberOfPayments = cotizacion.numero_pagos || 12;
    const useFiniquito = cotizacion.usar_finiquito || false;
    const finiquitoAmount = cotizacion.monto_finiquito || 0;
    
    let remainingBalance = totalPrice - downPayment;
    
    if (useFiniquito) {
      // If using finiquito, the remaining balance is distributed across payments excluding finiquito
      remainingBalance = remainingBalance - finiquitoAmount;
    }
    
    const paymentAmount = remainingBalance / numberOfPayments;
    
    // Create payment schedule
    const schedule = [];
    
    // Add down payment
    schedule.push({
      number: 0,
      date: new Date(),
      concept: 'Anticipo',
      amount: downPayment,
      balance: totalPrice - downPayment
    });
    
    // Add regular payments
    for (let i = 1; i <= numberOfPayments; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      
      const currentBalance = totalPrice - downPayment - (paymentAmount * i);
      
      schedule.push({
        number: i,
        date: date,
        concept: `Pago ${i} de ${numberOfPayments}`,
        amount: paymentAmount,
        balance: currentBalance
      });
    }
    
    // Add finiquito if applicable
    if (useFiniquito) {
      const finiquitoDate = new Date();
      finiquitoDate.setMonth(finiquitoDate.getMonth() + numberOfPayments + 1);
      
      schedule.push({
        number: numberOfPayments + 1,
        date: finiquitoDate,
        concept: 'Finiquito / Crédito hipotecario',
        amount: finiquitoAmount,
        balance: 0
      });
    }
    
    return schedule;
  };
  
  const paymentSchedule = generatePaymentSchedule(selectedCotizacion);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Cotizaciones</h1>
            <p className="text-slate-600">Gestiona las cotizaciones enviadas a clientes potenciales</p>
          </div>
          <div className="flex gap-2">
            <AdminResourceDialog 
              resourceType="cotizaciones" 
              buttonText="Nueva cotización"
              onSuccess={refetch}
            />
            
            {canCreateResource('cotizacion') && (
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lista de cotizaciones */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Cotizaciones recientes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-6 space-y-3">
                    <div className="h-10 bg-slate-100 animate-pulse rounded-md" />
                    <div className="h-10 bg-slate-100 animate-pulse rounded-md" />
                    <div className="h-10 bg-slate-100 animate-pulse rounded-md" />
                  </div>
                ) : error ? (
                  <div className="text-center py-6 text-red-500">
                    Error al cargar cotizaciones
                  </div>
                ) : cotizaciones.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    No hay cotizaciones registradas
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Prototipo</TableHead>
                        <TableHead>Anticipo</TableHead>
                        <TableHead>Pagos</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cotizaciones.map((cotizacion: ExtendedCotizacion) => (
                        <TableRow 
                          key={cotizacion.id}
                          className={selectedCotizacion?.id === cotizacion.id ? 'bg-slate-50' : ''}
                        >
                          <TableCell>
                            {cotizacion.lead?.nombre || 'Sin asignar'}
                          </TableCell>
                          <TableCell>
                            {cotizacion.prototipo?.nombre || 'Sin asignar'}
                          </TableCell>
                          <TableCell>
                            ${cotizacion.monto_anticipo?.toLocaleString() || 0}
                          </TableCell>
                          <TableCell>
                            {cotizacion.numero_pagos || 12} {cotizacion.usar_finiquito && '+ Finiquito'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewCotizacion(cotizacion)}
                            >
                              Ver detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Detalles de cotización */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedCotizacion ? 'Detalles de cotización' : 'Selecciona una cotización'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedCotizacion ? (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p>Selecciona una cotización para ver sus detalles</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header with client and property info */}
                    <div className="border-b pb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-slate-500">Cliente</h3>
                          <p className="font-medium">{selectedCotizacion.lead?.nombre || 'Sin asignar'}</p>
                          <p className="text-sm text-slate-500">
                            {selectedCotizacion.lead?.telefono} {selectedCotizacion.lead?.email && `• ${selectedCotizacion.lead.email}`}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-slate-500">Desarrollo</h3>
                          <p className="font-medium">{selectedCotizacion.desarrollo?.nombre || 'Sin asignar'}</p>
                          <h3 className="text-sm font-medium text-slate-500 mt-2">Prototipo</h3>
                          <p className="font-medium">{selectedCotizacion.prototipo?.nombre || 'Sin asignar'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment details */}
                    <div>
                      <h3 className="font-medium mb-3">Detalles de pago</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Precio total</p>
                          <p className="font-medium">${selectedCotizacion.prototipo?.precio.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Anticipo</p>
                          <p className="font-medium">${selectedCotizacion.monto_anticipo?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Número de pagos</p>
                          <p className="font-medium">{selectedCotizacion.numero_pagos || 12}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Tipo de plan</p>
                          <p className="font-medium">
                            {selectedCotizacion.usar_finiquito ? 'Con finiquito' : 'Pagos distribuidos'}
                          </p>
                        </div>
                        {selectedCotizacion.usar_finiquito && (
                          <div>
                            <p className="text-sm text-slate-500">Monto finiquito</p>
                            <p className="font-medium">${selectedCotizacion.monto_finiquito?.toLocaleString() || 0}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment schedule */}
                    <div>
                      <h3 className="font-medium mb-3">Plan de pagos</h3>
                      <div className="max-h-[300px] overflow-auto pr-1">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>No.</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Concepto</TableHead>
                              <TableHead className="text-right">Monto</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paymentSchedule.map((payment) => (
                              <TableRow key={payment.number}>
                                <TableCell>{payment.number}</TableCell>
                                <TableCell>
                                  {payment.date.toLocaleDateString('es-MX', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell>{payment.concept}</TableCell>
                                <TableCell className="text-right">
                                  ${payment.amount.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Notas */}
                    {selectedCotizacion.notas && (
                      <div>
                        <h3 className="font-medium mb-2">Notas</h3>
                        <p className="text-slate-600 text-sm">{selectedCotizacion.notas}</p>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="pt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <FileText className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CotizacionesPage;
