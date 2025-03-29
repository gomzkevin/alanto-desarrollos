
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
  alwaysAllowGenerate?: boolean; // New prop to allow generating units regardless of subscription limits
}

export const UnidadTableActions = ({ 
  onAddClick, 
  onGenerateClick, 
  unidadesCount,
  totalUnidades,
  showGenerateButton = true,
  canAddMore = true,
  alwaysAllowGenerate = false // Default to false for backward compatibility
}: UnidadTableActionsProps) => {
  // Mostrar botón de generar unidades solo cuando:
  // 1. Se solicita mostrar el botón (showGenerateButton)
  // 2. Hay unidades por generar (unidadesCount < totalUnidades)
  // 3. Está permitido crear más basado en los límites de suscripción O alwaysAllowGenerate es true
  const shouldShowGenerateButton = showGenerateButton && 
                                  unidadesCount < totalUnidades &&
                                  (canAddMore || alwaysAllowGenerate);
  
  // Mostrar botón de agregar unidad individual solo cuando:
  // 1. Se han generado unidades pero se han eliminado algunas (unidadesCount < totalUnidades)
  // 2. Al menos una unidad ya ha sido creada (unidadesCount > 0)
  // 3. Está permitido crear más basado en los límites de suscripción
  const shouldShowAddButton = unidadesCount > 0 && 
                              unidadesCount < totalUnidades &&
                              canAddMore;
  
  // Si no hay unidades creadas aún, solo mostrar el botón de generar
  const noUnidadesYet = unidadesCount === 0;
  
  // Determine if generate button should be disabled
  // It should NOT be disabled if alwaysAllowGenerate is true
  const isGenerateButtonDisabled = !canAddMore && !alwaysAllowGenerate;
  
  return (
    <div className="flex space-x-2">
      {shouldShowGenerateButton && (
        <Button 
          onClick={onGenerateClick} 
          variant={noUnidadesYet ? "default" : "outline"}
          // Only disable if subscription limits reached AND alwaysAllowGenerate is false
          disabled={isGenerateButtonDisabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Generar unidades
        </Button>
      )}
      
      {shouldShowAddButton && (
        <Button onClick={onAddClick} disabled={!canAddMore}>
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
