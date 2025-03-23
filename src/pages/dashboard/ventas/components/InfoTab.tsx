
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { Venta } from "@/hooks/types";
import { formatCurrency } from "@/lib/utils";
import { Pago } from "@/hooks/usePagos";

interface InfoTabProps {
  venta: Venta;
  compradores: Array<{
    id: string;
    comprador_id: string;
    nombre: string;
    porcentaje: number;
    pagos_realizados?: number;
    total_pagos?: number;
  }>;
  pagos: Pago[];
  onAddComprador: () => void;
}

export const InfoTab = ({ venta, compradores, pagos, onAddComprador }: InfoTabProps) => {
  // Calculate payments per buyer
  const pagosPorComprador = compradores.reduce((acc, comprador) => {
    acc[comprador.id] = pagos
      .filter(pago => pago.comprador_venta_id === comprador.id)
      .reduce((total, pago) => total + pago.monto, 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Compradores</CardTitle>
        <Button 
          size="sm"
          onClick={onAddComprador}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" /> Agregar Comprador
        </Button>
      </CardHeader>
      <CardContent>
        {compradores.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay compradores asignados a esta venta. Use el botón "Agregar Comprador" para asignar uno.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Tipo de venta: <span className="font-medium">{venta.es_fraccional ? 'Fraccional' : 'Individual'}</span>
              {venta.es_fraccional && compradores.length > 0 && (
                <span> - {compradores.length} copropietarios</span>
              )}
            </div>
            
            {compradores.map(comprador => {
              // Calculate the amount this buyer should pay based on percentage
              const montoComprador = venta.es_fraccional 
                ? (venta.precio_total * comprador.porcentaje) / 100 
                : venta.precio_total;
              
              // Get total payments made by this buyer
              const pagosRealizados = pagosPorComprador[comprador.id] || 0;
              
              // Calculate number of payments made by this buyer
              const numPagosRealizados = pagos.filter(
                pago => pago.comprador_venta_id === comprador.id
              ).length;

              return (
                <div key={comprador.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-slate-400" />
                    <div>
                      <p className="font-medium">{comprador.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {venta.es_fraccional ? (
                          <>Porcentaje: <span className="font-medium">{comprador.porcentaje}%</span></>
                        ) : (
                          <>Propietario único</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(montoComprador)}</p>
                    <p className="text-sm text-muted-foreground">
                      {numPagosRealizados} pagos registrados
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfoTab;
