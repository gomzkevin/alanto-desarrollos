
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import VentasTable from './components/VentasTable';
import { VirtualizedVentasTable } from './components/VirtualizedVentasTable';
import { useDebounce } from 'use-debounce';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

const VentasPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('todos');
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    // Simular un tiempo mínimo de carga para evitar flasheos
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // Al cargar la página, iniciar con un refresh automático
  useEffect(() => {
    if (empresaId && !isUserRoleLoading) {
      handleRefresh();
      // Después de obtener los datos y el primer renderizado, marcar como cargado inicialmente
      setTimeout(() => {
        setInitialLoading(false);
      }, 1000);
    }
  }, [empresaId, isUserRoleLoading]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground mb-6">
            Gestiona las ventas de unidades y da seguimiento a los pagos
          </p>
        </div>

        {/* Mostrar un loading skeleton mientras se está cargando inicialmente */}
        {isUserRoleLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md rounded-md mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        ) : (
          <>
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

                  <Button 
                    onClick={handleRefresh} 
                    variant="outline"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar"
                    )}
                  </Button>
                </div>
              </div>

              <VentasTable 
                refreshTrigger={refreshTrigger} 
                estadoFilter={statusFilter !== 'todos' ? statusFilter : undefined}
                initialLoading={initialLoading}
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VentasPage;
