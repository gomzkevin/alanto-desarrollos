
import React, { memo, useCallback } from 'react';
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
  
  // Memoize the handler functions to prevent them from being recreated on each render
  const handleEdit = useCallback(() => {
    onEdit(unidad);
  }, [unidad, onEdit]);

  const handleSell = useCallback(() => {
    onSell(unidad);
  }, [unidad, onSell]);
  
  return (
    <TableRow>
      <TableCell className="font-medium">{unidad.numero}</TableCell>
      <TableCell>{unidad.nivel || '-'}</TableCell>
      <TableCell><StatusBadge estado={unidad.estado} /></TableCell>
      <TableCell>
        {formatCurrency(precioLista)}
      </TableCell>
      <TableCell className="text-right">
        <UnidadActions 
          unidad={unidad} 
          onEdit={handleEdit} 
          onSell={handleSell}
          isDisabled={isDisabled}
        />
      </TableCell>
    </TableRow>
  );
});

UnidadTableRow.displayName = 'UnidadTableRow';

export default UnidadTableRow;
