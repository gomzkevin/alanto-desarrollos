
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import VentasTable from './components/VentasTable';
import VentasStatistics from './components/VentasStatistics';

const VentasPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showStats, setShowStats] = useState(true);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground mb-6">
            Gestiona las ventas de unidades y da seguimiento a los pagos
          </p>
        </div>

        {/* Statistics Section */}
        {showStats && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Estadísticas de Ventas</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowStats(false)}
                className="text-sm"
              >
                Ocultar estadísticas
              </Button>
            </div>
            <VentasStatistics />
          </div>
        )}

        {/* Control Bar - only show the "show stats" button when stats are hidden */}
        {!showStats && (
          <div className="flex justify-end mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowStats(true)}
              className="text-sm"
            >
              Mostrar estadísticas
            </Button>
          </div>
        )}

        {/* Sales Table Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex flex-grow max-w-md relative">
              <Input
                placeholder="Buscar ventas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="status-filter" className="whitespace-nowrap">Estado:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="w-[130px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleRefresh} variant="outline">
                Actualizar
              </Button>
            </div>
          </div>

          <VentasTable refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VentasPage;
