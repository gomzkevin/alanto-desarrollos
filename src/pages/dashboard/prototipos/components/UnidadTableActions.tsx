
import React, { useCallback } from 'react';
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

export const UnidadTableActions = React.memo(({ 
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
  
  // Memoize click handlers to prevent re-renders
  const handleAddClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onAddClick();
  }, [onAddClick]);
  
  const handleGenerateClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (onGenerateClick) {
      onGenerateClick();
    }
  }, [onGenerateClick]);
  
  return (
    <div className="flex space-x-2">
      {shouldShowGenerateButton && (
        <Button 
          onClick={handleGenerateClick} 
          variant={noUnidadesYet ? "default" : "outline"}
          disabled={isGenerateButtonDisabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Generar unidades
        </Button>
      )}
      
      {shouldShowAddButton && (
        <Button 
          onClick={handleAddClick} 
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
});

UnidadTableActions.displayName = 'UnidadTableActions';

export default UnidadTableActions;
