
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VentasTable } from './components/VentasTable';
import VentasStatistics from './components/VentasStatistics';
import useUserRole from '@/hooks/useUserRole';

const VentasPage = () => {
  const { empresaId } = useUserRole();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ventas</h1>
        <div className="text-sm text-muted-foreground">
          Las ventas se crean automáticamente al cambiar el estado de las unidades
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Lista de Ventas</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <VentasTable />
        </TabsContent>
        
        <TabsContent value="stats">
          <VentasStatistics />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default VentasPage;
