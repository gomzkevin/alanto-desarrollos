
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SubscriptionPlans() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acceso al Sistema</CardTitle>
          <CardDescription>
            Tienes acceso completo a todas las funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium">Detalles</h3>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-sm">
                  <span>Acceso:</span>
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
          <CardTitle>Información Adicional</CardTitle>
          <CardDescription>
            Versión simplificada del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta versión del sistema no utiliza sistema de suscripciones.
            Todos los usuarios con empresa asignada tienen acceso completo a las funcionalidades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionPlans;
