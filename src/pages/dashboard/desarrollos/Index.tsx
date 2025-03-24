import React, { useState } from 'react';
import { useDesarrollos } from '@/hooks/useDesarrollos';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';

interface DesarrolloFormData {
  // Define required fields for DesarrolloFormData
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  // Add other fields as needed
}

const DesarrollosPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { empresaId } = useUserRole();
  
  const { desarrollos, isLoading, refetch } = useDesarrollos();
  
  // Fix the createDesarrollos function to correctly handle form data
  const createDesarrollos = async (formData: DesarrolloFormData) => {
    if (!empresaId) {
      console.error('No empresa ID available');
      return null;
    }
    
    try {
      // Add the empresa_id to the form data
      const dataToInsert = {
        ...formData,
        empresa_id: empresaId
      };
      
      const { data, error } = await supabase
        .from('desarrollos')
        .insert(dataToInsert)
        .select();
        
      if (error) throw error;
      
      refetch();
      return data;
    } catch (error) {
      console.error('Error creating desarrollo:', error);
      return null;
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'PPP', { locale: es });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Desarrollos</h1>
        <AdminResourceDialog
          resourceType="desarrollos"
          buttonText="Nuevo desarrollo"
          buttonIcon={<PlusCircle className="mr-2 h-4 w-4" />}
          onSuccess={() => {
            refetch();
          }}
        />
      </div>
      
      <Table>
        <TableCaption>Lista de desarrollos de la empresa</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Nombre</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Total Unidades</TableHead>
            <TableHead>Unidades Disponibles</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Entrega</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {desarrollos?.map((desarrollo) => (
            <TableRow key={desarrollo.id}>
              <TableCell className="font-medium">{desarrollo.nombre}</TableCell>
              <TableCell>{desarrollo.ubicacion}</TableCell>
              <TableCell>{desarrollo.total_unidades}</TableCell>
              <TableCell>{desarrollo.unidades_disponibles}</TableCell>
              <TableCell>{desarrollo.fecha_inicio ? formatDate(desarrollo.fecha_inicio) : 'N/A'}</TableCell>
              <TableCell>{desarrollo.fecha_entrega ? formatDate(desarrollo.fecha_entrega) : 'N/A'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesarrollosPage;
