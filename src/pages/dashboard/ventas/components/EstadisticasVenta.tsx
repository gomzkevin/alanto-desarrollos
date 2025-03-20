
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils';
import { VentaBasica } from '@/hooks/useVentas';

interface EstadisticasVentaProps {
  venta: VentaBasica;
}

const EstadisticasVenta = ({ venta }: EstadisticasVentaProps) => {
  const compradores = venta.compradores || [];
  
  // Calcular el monto total pagado
  const montoPagado = compradores.reduce((sum, comprador) => {
    return sum + (comprador.total_pagado || 0);
  }, 0);
  
  // Calcular porcentaje de progreso general
  const porcentajeProgreso = venta.precio_total > 0 
    ? (montoPagado / venta.precio_total) * 100 
    : 0;
  
  // Calcular fecha estimada de finalización basada en el plan de pagos
  const calcularFechaEstimadaFin = () => {
    // Si ya está completada, devolver null
    if (venta.estado === 'completada') {
      return null;
    }
    
    // Buscar la fecha más lejana en los planes de pago
    let fechaMasLejana: Date | null = null;
    
    compradores.forEach(comprador => {
      const planPago = comprador.plan_pago;
      
      if (planPago) {
        // Si tiene fecha de finiquito y el plan incluye finiquito
        if (planPago.incluye_finiquito && planPago.fecha_finiquito) {
          const fechaFiniquito = new Date(planPago.fecha_finiquito);
          if (!fechaMasLejana || fechaFiniquito > fechaMasLejana) {
            fechaMasLejana = fechaFiniquito;
          }
        } 
        // Si no tiene finiquito, calcular por el plazo en meses
        else if (planPago.plazo_meses && planPago.plazo_meses > 0) {
          // Tomar fecha de anticipo o fecha de inicio de la venta
          const fechaInicio = planPago.fecha_anticipo 
            ? new Date(planPago.fecha_anticipo) 
            : new Date(venta.fecha_inicio);
          
          const fechaEstimada = new Date(fechaInicio);
          fechaEstimada.setMonth(fechaEstimada.getMonth() + planPago.plazo_meses);
          
          if (!fechaMasLejana || fechaEstimada > fechaMasLejana) {
            fechaMasLejana = fechaEstimada;
          }
        }
      }
    });
    
    return fechaMasLejana;
  };
  
  const fechaEstimadaFin = calcularFechaEstimadaFin();
  
  // Calcular tiempo restante en meses
  const calcularMesesRestantes = () => {
    if (!fechaEstimadaFin) return null;
    
    const hoy = new Date();
    const mesesDiferencia = 
      (fechaEstimadaFin.getFullYear() - hoy.getFullYear()) * 12 + 
      fechaEstimadaFin.getMonth() - hoy.getMonth();
    
    return Math.max(0, mesesDiferencia);
  };
  
  const mesesRestantes = calcularMesesRestantes();
  
  // Calcular velocidad de pagos (promedio mensual)
  const calcularVelocidadPagos = () => {
    if (montoPagado === 0) return 0;
    
    const fechaInicio = new Date(venta.fecha_inicio);
    const hoy = new Date();
    
    // Diferencia en meses
    const mesesTranscurridos = 
      (hoy.getFullYear() - fechaInicio.getFullYear()) * 12 + 
      hoy.getMonth() - fechaInicio.getMonth();
    
    if (mesesTranscurridos <= 0) return montoPagado;
    
    return montoPagado / mesesTranscurridos;
  };
  
  const velocidadPagosMensual = calcularVelocidadPagos();
  
  // Estimar meses para completar el pago basado en la velocidad actual
  const calcularMesesParaCompletar = () => {
    if (velocidadPagosMensual <= 0) return null;
    if (montoPagado >= venta.precio_total) return 0;
    
    const montoRestante = venta.precio_total - montoPagado;
    return Math.ceil(montoRestante / velocidadPagosMensual);
  };
  
  const mesesParaCompletar = calcularMesesParaCompletar();
  
  // Formatear fecha de manera legible
  const formatFecha = (fecha: Date | null) => {
    if (!fecha) return 'No determinada';
    
    return fecha.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Progreso de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(porcentajeProgreso)}%
            </div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              {formatCurrency(montoPagado)} de {formatCurrency(venta.precio_total)}
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-primary" 
                style={{ width: `${Math.min(100, porcentajeProgreso)}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Velocidad de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(velocidadPagosMensual)}
            </div>
            <p className="text-xs text-muted-foreground">
              promedio mensual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo Estimado Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mesesParaCompletar !== null ? `${mesesParaCompletar} meses` : 'Indeterminado'}
            </div>
            <p className="text-xs text-muted-foreground">
              basado en la velocidad actual
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Fecha Estimada Finalización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {venta.estado === 'completada' 
                ? 'Completada' 
                : formatFecha(fechaEstimadaFin)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {mesesRestantes !== null && mesesRestantes > 0 
                ? `En aproximadamente ${mesesRestantes} meses`
                : venta.estado === 'completada' 
                  ? 'Venta finalizada' 
                  : 'Fecha no determinada'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalle por Comprador</CardTitle>
          </CardHeader>
          <CardContent>
            {compradores.length === 0 ? (
              <p className="text-muted-foreground">No hay compradores registrados</p>
            ) : (
              <div className="space-y-4">
                {compradores.map(comprador => {
                  const totalPagado = comprador.total_pagado || 0;
                  const porcentajePagado = comprador.monto_comprometido > 0 
                    ? (totalPagado / comprador.monto_comprometido) * 100 
                    : 0;
                  
                  return (
                    <div key={comprador.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">{comprador.comprador?.nombre || 'Sin nombre'}</h4>
                        <span className="text-sm">
                          {venta.es_fraccional && `${comprador.porcentaje_propiedad}%`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between mb-3 text-sm">
                        <span className="text-muted-foreground">
                          Comprometido: {formatCurrency(comprador.monto_comprometido)}
                        </span>
                        <span className="text-muted-foreground">
                          Pagado: {formatCurrency(totalPagado)}
                        </span>
                      </div>
                      
                      <div className="h-2 w-full rounded-full bg-muted mb-1">
                        <div 
                          className="h-full rounded-full bg-primary" 
                          style={{ width: `${Math.min(100, porcentajePagado)}%` }}
                        />
                      </div>
                      
                      <div className="text-right text-xs text-muted-foreground">
                        {Math.round(porcentajePagado)}% completado
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Información del Plan de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {compradores.length === 0 ? (
              <p className="text-muted-foreground">No hay compradores registrados</p>
            ) : (
              <div className="space-y-4">
                {compradores.map(comprador => {
                  const planPago = comprador.plan_pago;
                  
                  if (!planPago) {
                    return (
                      <div key={comprador.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{comprador.comprador?.nombre || 'Sin nombre'}</h4>
                        <p className="text-muted-foreground">
                          No hay un plan de pagos configurado
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={comprador.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{comprador.comprador?.nombre || 'Sin nombre'}</h4>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Monto Total</p>
                          <p className="font-medium">{formatCurrency(planPago.monto_total)}</p>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Anticipo</p>
                          <p className="font-medium">{planPago.anticipo ? formatCurrency(planPago.anticipo) : 'No especificado'}</p>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Plazo</p>
                          <p className="font-medium">{planPago.plazo_meses} meses</p>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Pago Mensual</p>
                          <p className="font-medium">{planPago.monto_mensual ? formatCurrency(planPago.monto_mensual) : 'No especificado'}</p>
                        </div>
                        
                        {planPago.incluye_finiquito && (
                          <>
                            <div>
                              <p className="text-muted-foreground">Finiquito</p>
                              <p className="font-medium">{planPago.monto_finiquito ? formatCurrency(planPago.monto_finiquito) : 'No especificado'}</p>
                            </div>
                            
                            <div>
                              <p className="text-muted-foreground">Fecha Finiquito</p>
                              <p className="font-medium">
                                {planPago.fecha_finiquito
                                  ? new Date(planPago.fecha_finiquito).toLocaleDateString('es-MX')
                                  : 'No especificada'
                                }
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstadisticasVenta;
