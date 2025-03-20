
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, ShoppingCart } from "lucide-react";

interface UnidadActionsProps {
  unidad: any;
  onEdit: (unidad: any) => void;
  onSell: (unidad: any) => void;
  isDisabled?: boolean;
}

export const UnidadActions = ({ unidad, onEdit, onSell, isDisabled = false }: UnidadActionsProps) => {
  // Determinar si el botón de venta debe estar disponible
  const canSell = unidad.estado === 'disponible';
  
  return (
    <div className="flex justify-end space-x-2">
      {canSell && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onSell(unidad)}
          disabled={isDisabled}
          className="text-primary"
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          Vender
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onEdit(unidad)}
        disabled={isDisabled}
      >
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UnidadActions;
