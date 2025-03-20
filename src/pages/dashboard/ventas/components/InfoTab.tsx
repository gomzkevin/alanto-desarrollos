
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Venta } from "@/hooks/useVentas";

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
}

export const InfoTab = ({ venta, compradores }: InfoTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Compradores</CardTitle>
      </CardHeader>
      <CardContent>
        {compradores.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay compradores asignados a esta venta
          </div>
        ) : (
          compradores.map(comprador => (
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
                <p className="font-medium">{comprador.pagos_realizados || 0} / {comprador.total_pagos || 0}</p>
                <p className="text-sm text-muted-foreground">Pagos realizados</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default InfoTab;
