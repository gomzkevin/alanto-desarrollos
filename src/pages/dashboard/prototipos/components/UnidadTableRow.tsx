
import React, { memo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import StatusBadge from './StatusBadge';
import UnidadActions from './UnidadActions';
import { formatCurrency } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface UnidadTableRowProps {
  unidad: any;
  onEdit: (unidad: any) => void;
  onDelete: (unidad: any) => void;
}

export const UnidadTableRow = memo(({ unidad, onEdit, onDelete }: UnidadTableRowProps) => {
  // Check if unidad has a venta associated
  const hasVenta = unidad.estado !== 'disponible';
  
  return (
    <TableRow key={unidad.id}>
      <TableCell className="font-medium">{unidad.numero}</TableCell>
      <TableCell>{unidad.nivel || '-'}</TableCell>
      <TableCell><StatusBadge estado={unidad.estado} /></TableCell>
      <TableCell>
        {unidad.precio_venta 
          ? formatCurrency(unidad.precio_venta) 
          : '-'}
      </TableCell>
      <TableCell>
        {unidad.comprador_nombre 
          ? (
            <div className="flex items-center">
              <span className="truncate max-w-[120px]">{unidad.comprador_nombre}</span>
              {hasVenta && (
                <Link 
                  to={`/dashboard/ventas?filter=en_proceso&unidad=${unidad.id}`}
                  className="ml-1 text-primary hover:text-primary/80"
                  title="Ver seguimiento de venta"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )
          : '-'}
      </TableCell>
      <TableCell>{unidad.vendedor_nombre || '-'}</TableCell>
      <TableCell>
        {unidad.fecha_venta 
          ? new Date(unidad.fecha_venta).toLocaleDateString('es-MX') 
          : '-'}
      </TableCell>
      <TableCell>
        <UnidadActions 
          unidad={unidad} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      </TableCell>
    </TableRow>
  );
});

UnidadTableRow.displayName = 'UnidadTableRow';

export default UnidadTableRow;
