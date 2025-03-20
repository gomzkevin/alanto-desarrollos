
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VentasTable } from './components/VentasTable';
import { VentasStatistics } from './components/VentasStatistics';
import { NuevaVentaDialog } from './components/NuevaVentaDialog';

const VentasPage = () => {
  const [showAddVentaDialog, setShowAddVentaDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleVentaSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Ventas</h1>
        <Button onClick={() => setShowAddVentaDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Venta
        </Button>
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

      <NuevaVentaDialog
        open={showAddVentaDialog}
        onOpenChange={setShowAddVentaDialog}
        onSuccess={handleVentaSuccess}
      />
    </DashboardLayout>
  );
};

export default VentasPage;
