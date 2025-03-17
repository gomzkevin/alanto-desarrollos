
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UnidadTableActionsProps {
  onAddClick: () => void;
  onGenerateClick?: () => void;
  showGenerateButton?: boolean;
  unidadesCount: number;
  totalUnidades: number;
}

export const UnidadTableActions = ({ 
  onAddClick, 
  onGenerateClick, 
  showGenerateButton = false,
  unidadesCount,
  totalUnidades
}: UnidadTableActionsProps) => {
  return (
    <div className="flex space-x-2">
      {showGenerateButton && unidadesCount < totalUnidades && (
        <Button onClick={onGenerateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Generar unidades
        </Button>
      )}
      
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar unidad
      </Button>
    </div>
  );
};

export default UnidadTableActions;
