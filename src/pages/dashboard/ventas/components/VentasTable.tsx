import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useVentas } from '@/hooks';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useUserRole } from '@/hooks/useUserRole';
import VentaStatusBadge from './VentaStatusBadge';
import { VentaActionsMenu } from './VentaActionsMenu';
import { VentaFilterBar } from './VentaFilterBar';
import { PlusCircle, FileDown } from 'lucide-react';
import { CreateVentaDialog } from './CreateVentaDialog';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel } from '@/lib/excel';

export const VentasTable = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { empresaId } = useUserRole();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    estado: 'todos',
    fechaInicio: undefined,
    fechaFin: undefined,
    unidadId: undefined,
    compradorId: undefined,
    desarrolloId: undefined,
    empresa_id: empresaId ? String(empresaId) : undefined
  });

  // Update filters when empresaId changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      empresa_id: empresaId ? String(empresaId) : undefined
    }));
  }, [empresaId]);

  const { ventas, isLoading, refetch } = useVentas(filters);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleRowClick = (ventaId) => {
    navigate(`/dashboard/ventas/${ventaId}`);
  };

  const handleExportToExcel = () => {
    if (ventas.length === 0) {
      toast({
        title: "No hay datos para exportar",
        description: "Aplica otros filtros o crea nuevas ventas",
        variant: "destructive"
      });
      return;
    }

    const data = ventas.map((venta) => ({
      'ID': venta.id,
      'Unidad': venta.unidad ? venta.unidad.codigo : 'N/A',
      'Prototipo': venta.unidad && venta.unidad.prototipo?.nombre ? venta.unidad.prototipo.nombre : 'N/A',
      'Precio Total': formatCurrency(venta.precio_total),
      'Estado': venta.estado,
      'Fecha': formatDate(venta.fecha_inicio),
      'Última Actualización': formatDate(venta.fecha_actualizacion),
      'Es Fraccional': venta.es_fraccional ? 'Sí' : 'No'
    }));

    exportToExcel(data, 'Ventas', `Ventas_${new Date().toISOString().split('T')[0]}`);
    toast({
      title: "Exportación exitosa",
      description: "Los datos han sido exportados a Excel"
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Ventas</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToExcel}
            disabled={isLoading || ventas.length === 0}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      <VentaFilterBar filters={filters} onFilterChange={handleFilterChange} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unidad</TableHead>
              <TableHead>Prototipo</TableHead>
              <TableHead>Precio Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : ventas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron ventas con los filtros actuales
                </TableCell>
              </TableRow>
            ) : (
              ventas.map((venta) => (
                <TableRow
                  key={venta.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(venta.id)}
                >
                  <TableCell>{venta.unidad ? venta.unidad.codigo : 'N/A'}</TableCell>
                  <TableCell>{venta.unidad && venta.unidad.prototipo?.nombre ? venta.unidad.prototipo.nombre : 'N/A'}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(venta.precio_total)}</TableCell>
                  <TableCell>
                    <VentaStatusBadge estado={venta.estado} />
                  </TableCell>
                  <TableCell>{formatDate(venta.fecha_inicio)}</TableCell>
                  <TableCell className="text-right">
                    <VentaActionsMenu
                      venta={venta}
                      onRefresh={refetch}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateVentaDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};

export default VentasTable;
