
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Venta } from "@/hooks/types";

interface VentaActionsMenuProps {
  venta: Venta;
  onRefresh: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export const VentaActionsMenu = ({ venta, onRefresh, onClick }: VentaActionsMenuProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/dashboard/ventas/${venta.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // This would typically involve an API call
    toast({
      title: "Funcionalidad no implementada",
      description: "La eliminación de ventas no está disponible en este momento",
      variant: "destructive",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={onClick}>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} disabled>
          <Trash className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VentaActionsMenu;
