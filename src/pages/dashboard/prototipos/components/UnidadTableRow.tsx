
import React, { memo } from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import StatusBadge from './StatusBadge';
import UnidadActions from './UnidadActions';
import { formatCurrency } from '@/lib/utils';

interface UnidadTableRowProps {
  unidad: any;
  onEdit: (unidad: any) => void;
  onSell: (unidad: any) => void;
  isDisabled?: boolean;
}

export const UnidadTableRow = memo(({ unidad, onEdit, onSell, isDisabled = false }: UnidadTableRowProps) => {
  // Determinar el precio a mostrar (precio de lista)
  const precioLista = unidad.prototipo?.precio || 0;
  
  return (
    <TableRow key={unidad.id}>
      <TableCell className="font-medium">{unidad.numero}</TableCell>
      <TableCell>{unidad.nivel || '-'}</TableCell>
      <TableCell><StatusBadge estado={unidad.estado} /></TableCell>
      <TableCell>
        {formatCurrency(precioLista)}
      </TableCell>
      <TableCell className="text-right">
        <UnidadActions 
          unidad={unidad} 
          onEdit={onEdit} 
          onSell={onSell}
          isDisabled={isDisabled}
        />
      </TableCell>
    </TableRow>
  );
});

UnidadTableRow.displayName = 'UnidadTableRow';

export default UnidadTableRow;
