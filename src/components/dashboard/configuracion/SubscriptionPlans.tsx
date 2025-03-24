
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResourceCounts } from "@/hooks/useResourceCounts";

export function SubscriptionPlans() {
  const { resourceCounts } = useResourceCounts();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Activo</CardTitle>
          <CardDescription>
            Tu plan actual no tiene límites de uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium">Detalles del Plan</h3>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Plan actual:</span>
                  <span>{resourceCounts.currentPlan?.name || 'Plan Ilimitado'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estado:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Activo
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Desarrollos:</span>
                  <span>Ilimitados</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Vendedores:</span>
                  <span>Ilimitados</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Facturación</CardTitle>
          <CardDescription>
            Esta versión del sistema no incluye facturación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Estás utilizando una versión sin facturación del sistema. No hay cargos asociados a tu uso actual.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionPlans;
