
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UnidadTableActionsProps {
  onAddClick: () => void;
  onGenerateClick?: () => void;
  unidadesCount: number;
  totalUnidades: number;
  showGenerateButton?: boolean;
  canAddMore?: boolean;
  alwaysAllowGenerate?: boolean;
  permissionsLoaded?: boolean;
}

export const UnidadTableActions = ({ 
  onAddClick, 
  onGenerateClick, 
  unidadesCount,
  totalUnidades,
  showGenerateButton = true,
  canAddMore = true,
  alwaysAllowGenerate = false,
  permissionsLoaded = true
}: UnidadTableActionsProps) => {
  // Calculate visibility conditions only once
  const shouldShowGenerateButton = React.useMemo(() => {
    return showGenerateButton && 
           unidadesCount < totalUnidades &&
           (canAddMore || alwaysAllowGenerate);
  }, [showGenerateButton, unidadesCount, totalUnidades, canAddMore, alwaysAllowGenerate]);
  
  const shouldShowAddButton = React.useMemo(() => {
    return unidadesCount > 0 && 
           unidadesCount < totalUnidades &&
           canAddMore;
  }, [unidadesCount, totalUnidades, canAddMore]);
  
  const noUnidadesYet = unidadesCount === 0;
  
  const isGenerateButtonDisabled = !permissionsLoaded || (!canAddMore && !alwaysAllowGenerate);
  const isAddButtonDisabled = !permissionsLoaded || !canAddMore;
  
  return (
    <div className="flex space-x-2">
      {shouldShowGenerateButton && (
        <Button 
          onClick={onGenerateClick} 
          variant={noUnidadesYet ? "default" : "outline"}
          disabled={isGenerateButtonDisabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Generar unidades
        </Button>
      )}
      
      {shouldShowAddButton && (
        <Button 
          onClick={onAddClick} 
          disabled={isAddButtonDisabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar unidad
        </Button>
      )}
      
      {!canAddMore && unidadesCount < totalUnidades && !alwaysAllowGenerate && (
        <Button variant="outline" disabled className="opacity-70">
          <Plus className="mr-2 h-4 w-4" />
          Límite alcanzado
        </Button>
      )}
    </div>
  );
};

export default UnidadTableActions;
