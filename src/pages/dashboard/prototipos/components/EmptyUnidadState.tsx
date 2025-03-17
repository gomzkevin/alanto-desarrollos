
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyUnidadStateProps {
  onAddClick: () => void;
}

export const EmptyUnidadState = ({ onAddClick }: EmptyUnidadStateProps) => {
  return (
    <div className="text-center py-8 border rounded-md bg-gray-50">
      <p className="text-gray-500">No hay unidades registradas para este prototipo.</p>
      <Button onClick={onAddClick} variant="outline" className="mt-2">
        <Plus className="h-4 w-4 mr-1" /> Agregar Unidad
      </Button>
    </div>
  );
};

export default EmptyUnidadState;
