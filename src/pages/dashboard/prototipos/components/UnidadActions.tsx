
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, ClipboardCheck } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface UnidadActionsProps {
  unidad: any;
  onEdit: (unidad: any) => void;
  onDelete: (unidad: any) => void;
}

export const UnidadActions = ({ unidad, onEdit, onDelete }: UnidadActionsProps) => {
  const navigate = useNavigate();
  
  // Check if unidad has a venta associated
  const hasVenta = unidad.estado !== 'disponible';
  
  // Handle navigate to venta
  const handleNavigateToVenta = () => {
    // Fetch ventas filtered by this unidad
    navigate(`/dashboard/ventas?filter=en_proceso&unidad=${unidad.id}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit(unidad)}>
          <Edit className="h-4 w-4 mr-2" /> Editar
        </DropdownMenuItem>
        {hasVenta && (
          <DropdownMenuItem onClick={handleNavigateToVenta}>
            <ClipboardCheck className="h-4 w-4 mr-2" /> Seguimiento de venta
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          className="text-red-500" 
          onClick={() => onDelete(unidad)}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UnidadActions;
