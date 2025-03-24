
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VentasTable } from './components/VentasTable';
import VentasStatistics from './components/VentasStatistics';
import RequireSubscription from '@/components/auth/RequireSubscription';

const VentasPage = () => {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RequireSubscription moduleName="Ventas">
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
    </RequireSubscription>
  );
};

export default VentasPage;
