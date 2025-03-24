
import React, { useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VentasTable } from './components/VentasTable';
import VentasStatistics from './components/VentasStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import { useUserRole } from '@/hooks/useUserRole';

const VentasPage = () => {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const { isLoading: authLoading, isAuthorized, userId, empresaId } = useSubscriptionAuth({
    redirectPath: '/dashboard',
    requiredModule: 'Ventas'
  });
  
  const { userRole } = useUserRole();

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Añadir console.logs para depurar
  console.log('VentasPage - isAuthorized:', isAuthorized);
  console.log('VentasPage - authLoading:', authLoading);
  console.log('VentasPage - userId:', userId);
  console.log('VentasPage - empresaId:', empresaId);
  console.log('VentasPage - userRole:', userRole);

  // Render loading state
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 px-6 py-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <div className="grid gap-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Si el usuario tiene userId pero aún no tiene empresaId, darle acceso temporal
  // Esto arregla el problema común donde empresaId no se carga a tiempo
  if (!isAuthorized && userId && !empresaId) {
    console.log('VentasPage - Usuario sin empresa asignada, dando acceso temporal');
    return renderAuthorizedContent();
  }

  // Render unauthorized state
  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="px-6 py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso restringido</AlertTitle>
            <AlertDescription>
              No tienes acceso al módulo de Ventas. Por favor, contacta al administrador o verifica que tu empresa tenga una suscripción activa.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Render authorized content
  return renderAuthorizedContent();
  
  // Extraer el contenido autorizado a una función para evitar duplicación
  function renderAuthorizedContent() {
    return (
      <DashboardLayout>
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold">Ventas</h1>
            <div className="text-sm text-muted-foreground max-w-md">
              Las ventas se crean automáticamente al cambiar el estado de las unidades
            </div>
          </div>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Lista de Ventas</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <VentasTable refreshTrigger={refreshTrigger} />
            </TabsContent>
            
            <TabsContent value="stats">
              <VentasStatistics />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
  }
};

export default VentasPage;
