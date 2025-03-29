
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
import { ExtendedCotizacion } from '@/hooks/useCotizaciones';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CotizacionesTableProps {
  cotizaciones: ExtendedCotizacion[];
  isLoading: boolean;
  refetch: () => void;
}

const CotizacionesTable = ({ cotizaciones, isLoading, refetch }: CotizacionesTableProps) => {
  if (isLoading) {
    return (
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Desarrollo</TableHead>
              <TableHead>Prototipo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (cotizaciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay cotizaciones disponibles.
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Desarrollo</TableHead>
            <TableHead>Prototipo</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cotizaciones.map((cotizacion) => {
            const leadName = cotizacion.lead?.nombre || 'Cliente no registrado';
            const desarrolloName = cotizacion.desarrollo?.nombre || 'No especificado';
            const prototipoName = cotizacion.prototipo?.nombre || 'No especificado';
            const prototipoPrice = cotizacion.prototipo?.precio || 0;
            
            return (
              <TableRow key={cotizacion.id}>
                <TableCell className="font-mono text-xs">{cotizacion.id.substring(0, 8)}</TableCell>
                <TableCell>{leadName}</TableCell>
                <TableCell>{desarrolloName}</TableCell>
                <TableCell>{prototipoName}</TableCell>
                <TableCell>{formatCurrency(prototipoPrice)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CotizacionesTable;
