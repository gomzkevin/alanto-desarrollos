
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Venta } from '@/hooks/types';
import { formatCurrency } from '@/lib/utils';
import { Users, PlusCircle } from 'lucide-react';

interface InfoTabComprador {
  id: string;
  comprador_id: string;
  nombre: string;
  porcentaje: number;
  pagos_realizados?: number;
  total_pagos?: number;
}

interface InfoTabProps {
  venta: Venta;
  compradores: InfoTabComprador[];
  pagos: any[];
  onAddComprador: () => void;
}

export const InfoTab = ({ venta, compradores, pagos, onAddComprador }: InfoTabProps) => {
  const totalPagos = pagos.length;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="mr-2 h-5 w-5 text-muted-foreground" />
              Compradores Asignados
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onAddComprador}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {compradores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay compradores asignados a esta venta.</p>
              <p className="mt-2">Agregue un comprador para comenzar a registrar pagos.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {compradores.map((comprador) => (
                <div key={comprador.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{comprador.nombre}</h3>
                      <p className="text-sm text-muted-foreground">
                        Porcentaje: {comprador.porcentaje}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{comprador.pagos_realizados || 0} pagos</Badge>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monto comprometido</p>
                      <p className="font-medium">
                        {formatCurrency((venta.precio_total * comprador.porcentaje) / 100)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total pagado</p>
                      <p className="font-medium">
                        {formatCurrency(
                          pagos
                            .filter(p => p.comprador_venta_id === comprador.id)
                            .reduce((sum, p) => sum + p.monto, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {totalPagos > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Resumen de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total de Pagos</p>
                <p className="text-2xl font-bold">{totalPagos}</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Pagado</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(pagos.reduce((sum, p) => sum + p.monto, 0))}
                </p>
              </div>
              <div className="bg-primary/5 p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Pendiente</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(
                    venta.precio_total - pagos.reduce((sum, p) => sum + p.monto, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
