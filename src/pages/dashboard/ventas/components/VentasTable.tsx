import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import { useVentasQuery } from '@/hooks/ventas/useVentasQuery';
import { formatCurrency } from '@/lib/utils';

interface VentasTableProps {
  refreshTrigger?: number;
  estadoFilter?: string;
  desarrolloId?: string;
  prototipoId?: string;
}

const VentasTable = ({ refreshTrigger = 0, estadoFilter, desarrolloId, prototipoId }: VentasTableProps) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const router = useNavigate();
  
  const { 
    ventas, 
    isLoading, 
    isError, 
    refetch 
  } = useVentasQuery({
    estado: estadoFilter,
    desarrolloId,
    prototipoId,
    limit: 50
  });

  const handleViewDetails = (ventaId: string) => {
    router(`/dashboard/ventas/${ventaId}`);
  };

  const renderVentasTable = () => {
    if (isLoading) {
      return <div>Cargando ventas...</div>;
    }

    if (isError) {
      return <div>Error al cargar ventas.</div>;
    }

    if (!ventas || ventas.length === 0) {
      return <div>No hay ventas registradas.</div>;
    }

    return (
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Precio Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ventas.map((venta) => (
              <TableRow key={venta.id}>
                <TableCell>{venta.id}</TableCell>
                <TableCell>{new Date(venta.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{venta.unidad?.numero}</TableCell>
                <TableCell>{formatCurrency(venta.precio_total)}</TableCell>
                <TableCell>{venta.estado}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(venta.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div>
      {renderVentasTable()}
    </div>
  );
};

export default VentasTable;
