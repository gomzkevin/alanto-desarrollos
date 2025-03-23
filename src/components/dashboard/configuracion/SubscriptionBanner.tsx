
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import useSubscriptionInfo from '@/hooks/useSubscriptionInfo';

export default function SubscriptionBanner() {
  const { subscriptionInfo, isLoading } = useSubscriptionInfo();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <Card className="mb-6 animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-4"></div>
          <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (subscriptionInfo.isActive) {
    // Si hay una suscripción activa, mostrar un banner de confirmación
    return (
      <Alert className="mb-6 bg-green-50 border-green-200">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800">Suscripción activa</AlertTitle>
        <AlertDescription className="text-green-700">
          Tu suscripción al plan {subscriptionInfo.currentPlan?.name} está activa.
          {subscriptionInfo.renewalDate && (
            <span> La próxima renovación será el {new Date(subscriptionInfo.renewalDate).toLocaleDateString()}.</span>
          )}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Si no hay suscripción activa, mostrar un banner de advertencia
  return (
    <Card className="mb-6 border-amber-300 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-amber-800">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
          Suscripción requerida
        </CardTitle>
        <CardDescription className="text-amber-700">
          Necesitas una suscripción activa para acceder a todas las funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent className="text-amber-700">
        <p>
          Actualmente tu cuenta no tiene una suscripción activa. Al suscribirte, podrás:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Gestionar desarrollos y propiedades</li>
          <li>Administrar leads y cotizaciones</li>
          <li>Controlar ventas y pagos</li>
          <li>Generar proyecciones financieras</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => navigate('/dashboard/configuracion')}
        >
          Ver planes disponibles
        </Button>
      </CardFooter>
    </Card>
  );
}
