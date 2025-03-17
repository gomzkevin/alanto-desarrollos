
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useUnidades from "@/hooks/useUnidades";
import useLeads from "@/hooks/useLeads";
import { UnidadForm } from "./UnidadForm";

interface UnidadTableProps {
  prototipoId: string;
  prototipoNombre: string;
}

export const UnidadTable = ({ prototipoId, prototipoNombre }: UnidadTableProps) => {
  const { toast } = useToast();
  const { unidades, isLoading, createUnidad, updateUnidad, deleteUnidad, refetch } = useUnidades(prototipoId);
  const { leads } = useLeads();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Use this effect to ensure we clean up state when component unmounts
  useEffect(() => {
    return () => {
      setCurrentUnidad(null);
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setIsDeleteDialogOpen(false);
    };
  }, []);

  const handleAddUnidad = useCallback(async (data: any) => {
    try {
      await createUnidad({
        prototipo_id: prototipoId,
        numero: data.numero,
        estado: data.estado,
        nivel: data.nivel,
        precio_venta: data.precio_venta,
        comprador_id: data.comprador_id,
        comprador_nombre: data.comprador_nombre,
        vendedor_id: data.vendedor_id,
        vendedor_nombre: data.vendedor_nombre,
        fecha_venta: data.fecha_venta
      });
      
      toast({
        title: "Unidad creada",
        description: "La unidad ha sido creada exitosamente"
      });
      
      setIsAddDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo crear la unidad: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [prototipoId, createUnidad, toast, refetch]);

  const handleEditUnidad = useCallback(async (data: any) => {
    if (!currentUnidad) return;
    
    try {
      await updateUnidad({
        id: currentUnidad.id,
        numero: data.numero,
        estado: data.estado,
        nivel: data.nivel,
        precio_venta: data.precio_venta,
        comprador_id: data.comprador_id,
        comprador_nombre: data.comprador_nombre,
        vendedor_id: data.vendedor_id,
        vendedor_nombre: data.vendedor_nombre,
        fecha_venta: data.fecha_venta
      });
      
      toast({
        title: "Unidad actualizada",
        description: "La unidad ha sido actualizada exitosamente"
      });
      
      setIsEditDialogOpen(false);
      setCurrentUnidad(null);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo actualizar la unidad: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [currentUnidad, updateUnidad, toast, refetch]);

  const handleDeleteUnidad = useCallback(async () => {
    if (!currentUnidad) return;
    
    try {
      await deleteUnidad(currentUnidad.id);
      
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente"
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentUnidad(null);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `No se pudo eliminar la unidad: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [currentUnidad, deleteUnidad, toast, refetch]);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setCurrentUnidad(null);
  }, []);

  const openEditDialog = useCallback((unidad: any) => {
    setCurrentUnidad(unidad);
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((unidad: any) => {
    setCurrentUnidad(unidad);
    setIsDeleteDialogOpen(true);
  }, []);

  const renderStatusBadge = useCallback((estado: string) => {
    switch (estado) {
      case 'disponible':
        return <Badge className="bg-green-500 hover:bg-green-600">Disponible</Badge>;
      case 'apartado':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Apartado</Badge>;
      case 'en_proceso':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">En Proceso</Badge>;
      case 'vendido':
        return <Badge className="bg-red-500 hover:bg-red-600">Vendido</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">Cargando unidades...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Unidades de {prototipoNombre}</h2>
        <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Agregar Unidad
        </Button>
      </div>
      
      {unidades.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No hay unidades registradas para este prototipo.</p>
          <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="mt-2">
            <Plus className="h-4 w-4 mr-1" /> Agregar Unidad
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número/ID</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Fecha Venta</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unidades.map((unidad) => (
                <TableRow key={unidad.id}>
                  <TableCell className="font-medium">{unidad.numero}</TableCell>
                  <TableCell>{unidad.nivel || '-'}</TableCell>
                  <TableCell>{renderStatusBadge(unidad.estado)}</TableCell>
                  <TableCell>
                    {unidad.precio_venta 
                      ? `$${unidad.precio_venta.toLocaleString('es-MX')}` 
                      : '-'}
                  </TableCell>
                  <TableCell>{unidad.comprador_nombre || '-'}</TableCell>
                  <TableCell>{unidad.vendedor_nombre || '-'}</TableCell>
                  <TableCell>
                    {unidad.fecha_venta 
                      ? new Date(unidad.fecha_venta).toLocaleDateString('es-MX') 
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(unidad)}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-500" 
                          onClick={() => openDeleteDialog(unidad)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Unit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <UnidadForm 
            onSubmit={handleAddUnidad}
            onCancel={() => setIsAddDialogOpen(false)}
            leads={leads}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Unit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-md">
          {currentUnidad && (
            <UnidadForm 
              unidad={currentUnidad}
              onSubmit={handleEditUnidad}
              onCancel={closeEditDialog}
              leads={leads}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La unidad será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setCurrentUnidad(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUnidad} className="bg-red-500 hover:bg-red-600">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UnidadTable;
