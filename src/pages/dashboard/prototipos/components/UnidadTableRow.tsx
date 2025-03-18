
import React, { memo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import StatusBadge from './StatusBadge';
import UnidadActions from './UnidadActions';
import { formatCurrency } from '@/lib/utils';

interface UnidadTableRowProps {
  unidad: any;
  onEdit: (unidad: any) => void;
  onDelete: (unidad: any) => void;
}

export const UnidadTableRow = memo(({ unidad, onEdit, onDelete }: UnidadTableRowProps) => {
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
      <TableCell>{unidad.comprador_nombre || '-'}</TableCell>
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
