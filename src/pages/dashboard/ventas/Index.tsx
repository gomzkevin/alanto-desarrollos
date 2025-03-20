
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Building2, ListFilter, BarChart3, Search, RefreshCw
} from 'lucide-react';
import VentasList from './components/VentasList';
import VentasStatistics from './components/VentasStatistics';
import FilterDialog from './components/FilterDialog';
import LoadingSpinner from '@/components/ui/spinner';
import { useVentas } from '@/hooks/useVentas';

const VentasPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'lista';
  const filter = searchParams.get('filter') || 'todas';
  const desarrolloId = searchParams.get('desarrollo') || undefined;
  
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { ventas, isLoading, refetch } = useVentas({
    estado: filter !== 'todas' ? filter : undefined,
    desarrolloId: desarrolloId || undefined,
    includeRelations: true,
    includeCompradores: true,
    includePagos: true
  });

  const handleTabChange = (value: string) => {
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  const handleFilterChange = (estado: string, desarrollo?: string) => {
    searchParams.set('filter', estado);
    
    if (desarrollo) {
      searchParams.set('desarrollo', desarrollo);
    } else {
      searchParams.delete('desarrollo');
    }
    
    setSearchParams(searchParams);
    setIsFilterDialogOpen(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filterLabel = () => {
    if (filter === 'todas') return 'Todas las ventas';
    if (filter === 'en_proceso') return 'Ventas en proceso';
    if (filter === 'completada') return 'Ventas completadas';
    return 'Ventas filtradas';
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" /> Seguimiento de Ventas
            </h1>
            <p className="text-slate-500">
              Administra y da seguimiento a las ventas de unidades
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
              <ListFilter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <TabsList>
                <TabsTrigger value="lista" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  Lista de Ventas
                </TabsTrigger>
                <TabsTrigger value="estadisticas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estadísticas
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <span>
                  {filterLabel()}
                  {desarrolloId && ' (Desarrollo filtrado)'}
                </span>
              </div>
            </div>

            <TabsContent value="lista" className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                  <span className="ml-3 text-lg text-slate-600">Cargando ventas...</span>
                </div>
              ) : (
                <VentasList ventas={ventas} />
              )}
            </TabsContent>

            <TabsContent value="estadisticas" className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner />
                  <span className="ml-3 text-lg text-slate-600">Cargando estadísticas...</span>
                </div>
              ) : (
                <VentasStatistics ventas={ventas} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FilterDialog 
        isOpen={isFilterDialogOpen} 
        onClose={() => setIsFilterDialogOpen(false)}
        onFilter={handleFilterChange}
        currentFilter={filter}
        currentDesarrolloId={desarrolloId || undefined}
      />
    </DashboardLayout>
  );
};

export default VentasPage;
