
import React, { memo, useCallback } from 'react';
import { MoreHorizontal, Edit, Trash2, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UnidadActionsProps {
  unidad: any;
  onEdit: (unidad: any) => void;
  onSell: (unidad: any) => void;
  isDisabled?: boolean;
}

// Use React.memo to prevent unnecessary re-renders
const UnidadActions = memo(({ 
  unidad, 
  onEdit, 
  onSell, 
  isDisabled = false 
}: UnidadActionsProps) => {
  // Use useCallback to memoize handler functions
  const handleEdit = useCallback(() => {
    onEdit(unidad);
  }, [unidad, onEdit]);
  
  const handleSell = useCallback(() => {
    onSell(unidad);
  }, [unidad, onSell]);
  
  const isEditDisabled = isDisabled || unidad.estado === 'vendido';
  const isSellDisabled = isDisabled || unidad.estado !== 'disponible';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleEdit}
          disabled={isEditDisabled}
          className={isEditDisabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleSell}
          disabled={isSellDisabled}
          className={isSellDisabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Vender
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UnidadActions.displayName = 'UnidadActions';

export default UnidadActions;
