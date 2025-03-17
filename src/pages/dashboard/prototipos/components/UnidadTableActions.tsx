
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface UnidadTableActionsProps {
  onAddClick: () => void;
  onGenerateClick?: () => void;
  unidadesCount: number;
  totalUnidades: number;
  showGenerateButton?: boolean;
}

export const UnidadTableActions = ({ 
  onAddClick, 
  onGenerateClick, 
  unidadesCount,
  totalUnidades,
  showGenerateButton = true
}: UnidadTableActionsProps) => {
  // Mostrar botón de generar unidades solo cuando:
  // 1. Se solicita mostrar el botón (showGenerateButton)
  // 2. Hay unidades por generar (unidadesCount < totalUnidades)
  const shouldShowGenerateButton = showGenerateButton && unidadesCount < totalUnidades;
  
  // Mostrar botón de agregar unidad individual solo cuando:
  // Se han generado unidades pero se han eliminado algunas (unidadesCount < totalUnidades)
  // Y al menos una unidad ya ha sido creada (unidadesCount > 0)
  const shouldShowAddButton = unidadesCount > 0 && unidadesCount < totalUnidades;
  
  // Si no hay unidades creadas aún, solo mostrar el botón de generar
  const noUnidadesYet = unidadesCount === 0;
  
  return (
    <div className="flex space-x-2">
      {shouldShowGenerateButton && (
        <Button onClick={onGenerateClick} variant={noUnidadesYet ? "default" : "outline"}>
          <Plus className="mr-2 h-4 w-4" />
          Generar unidades
        </Button>
      )}
      
      {shouldShowAddButton && (
        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar unidad
        </Button>
      )}
    </div>
  );
};

export default UnidadTableActions;
