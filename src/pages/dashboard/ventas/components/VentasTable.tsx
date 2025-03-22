
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Eye, Plus, RefreshCw } from 'lucide-react';
import useVentas from '@/hooks/useVentas';
import { Badge } from '@/components/ui/badge';

interface VentasTableProps {
  refreshTrigger?: number;
  empresa_id?: number | null;
}

export const VentasTable: React.FC<VentasTableProps> = ({ 
  refreshTrigger = 0,
  empresa_id 
}) => {
  const navigate = useNavigate();
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  
  const { ventas, isLoading } = useVentas({
    estado: estadoFilter !== 'todos' ? estadoFilter : undefined,
    empresa_id
  });

  const handleViewVenta = (ventaId: string) => {
    navigate(`/dashboard/ventas/${ventaId}`);
  };

  // Helper function to get badge color based on state
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="border shadow-sm">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Select
            value={estadoFilter}
            onValueChange={setEstadoFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="en_proceso">En proceso</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Cargando ventas...</span>
        </div>
      ) : ventas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Plus className="h-12 w-12 text-gray-300 mb-2" />
          <p className="text-gray-500 mb-4">No hay ventas registradas</p>
          <p className="text-sm text-gray-400 mb-4">
            Las ventas se crean automáticamente al cambiar el estado de las unidades
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidad</TableHead>
                <TableHead>Desarrollo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell className="font-medium">
                    {venta.unidad?.numero || "N/A"}
                  </TableCell>
                  <TableCell>
                    {venta.unidad?.prototipo?.desarrollo?.nombre || "N/A"}
                  </TableCell>
                  <TableCell>{formatCurrency(venta.precio_total)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(venta.estado)}`}>
                      {venta.estado.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(venta.fecha_inicio).toLocaleDateString('es-MX')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVenta(venta.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
