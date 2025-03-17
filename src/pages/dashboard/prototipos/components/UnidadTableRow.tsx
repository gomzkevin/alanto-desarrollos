
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import StatusBadge from './StatusBadge';
import UnidadActions from './UnidadActions';

interface UnidadTableRowProps {
  unidad: any;
  onEdit: (unidad: any) => void;
  onDelete: (unidad: any) => void;
}

export const UnidadTableRow = ({ unidad, onEdit, onDelete }: UnidadTableRowProps) => {
  return (
    <TableRow key={unidad.id}>
      <TableCell className="font-medium">{unidad.numero}</TableCell>
      <TableCell>{unidad.nivel || '-'}</TableCell>
      <TableCell><StatusBadge estado={unidad.estado} /></TableCell>
      <TableCell>
        {unidad.precio_venta 
          ? `$${unidad.precio_venta.toLocaleString('es-MX')}` 
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
};

export default UnidadTableRow;
