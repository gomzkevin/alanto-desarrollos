
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import UnidadTableRow from './components/UnidadTableRow';
import EmptyUnidadState from './components/EmptyUnidadState';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DeleteUnidadDialog from './components/DeleteUnidadDialog';
import { UnidadForm } from "./UnidadForm";
import useLeads from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";
import useUnidades from '@/hooks/useUnidades';

export interface UnidadTableProps {
  prototipo: ExtendedPrototipo;
  unidades: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const UnidadTable = ({ 
  prototipo, 
  unidades = [], 
  isLoading = false,
  onRefresh
}: UnidadTableProps) => {
  const { toast } = useToast();
  const { leads } = useLeads();
  const { 
    createUnidad, 
    updateUnidad, 
    deleteUnidad,
    invalidateUnidades
  } = useUnidades({ prototipo_id: prototipo.id });
  
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Helper function to normalize price
  const normalizePrice = (price: any): number | undefined => {
    if (price === undefined || price === null) return undefined;
    
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[$,]/g, ''));
    }
    
    return Number(price);
  };

  // Handle add unidad
  const handleAddUnidad = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createUnidad({
        prototipo_id: prototipo.id,
        numero: data.numero,
        estado: data.estado,
        nivel: data.nivel,
        precio_venta: normalizePrice(data.precio_venta),
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
      
      // Wait before refreshing
      setTimeout(() => {
        if (onRefresh) onRefresh();
        invalidateUnidades();
      }, 500);
    } catch (error: any) {
      console.error("Error creating unidad:", error);
      toast({
        title: "Error",
        description: `No se pudo crear la unidad: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit unidad
  const handleEditUnidad = async (data: any) => {
    if (!currentUnidad) return;
    
    setIsSubmitting(true);
    try {
      await updateUnidad({
        id: currentUnidad.id,
        numero: data.numero,
        estado: data.estado,
        nivel: data.nivel,
        precio_venta: normalizePrice(data.precio_venta),
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
      
      // Wait before refreshing
      setTimeout(() => {
        if (onRefresh) onRefresh();
        invalidateUnidades();
      }, 500);
    } catch (error: any) {
      console.error("Error updating unidad:", error);
      toast({
        title: "Error",
        description: `No se pudo actualizar la unidad: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete unidad
  const handleDeleteUnidad = async () => {
    if (!currentUnidad) return;
    
    setIsSubmitting(true);
    try {
      await deleteUnidad(currentUnidad.id);
      
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente"
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentUnidad(null);
      
      // Wait before refreshing
      setTimeout(() => {
        if (onRefresh) onRefresh();
        invalidateUnidades();
      }, 500);
    } catch (error: any) {
      console.error("Error deleting unidad:", error);
      toast({
        title: "Error",
        description: `No se pudo eliminar la unidad: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dialog open handlers
  const openEditDialog = (unidad: any) => {
    if (isSubmitting) return;
    setCurrentUnidad(unidad);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (unidad: any) => {
    if (isSubmitting) return;
    setCurrentUnidad(unidad);
    setIsDeleteDialogOpen(true);
  };

  // Simple loading state display
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Cargando unidades...</span>
      </div>
    );
  }

  // Check for empty state
  const hasUnidades = unidades && unidades.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Unidades de {prototipo.nombre}</h2>
        
        <div className="flex space-x-2">
          <button
            className="bg-primary text-white px-3 py-2 rounded-md hover:bg-primary/90"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={isSubmitting}
          >
            Agregar Unidad
          </button>
        </div>
      </div>
      
      {!hasUnidades ? (
        <EmptyUnidadState onAddClick={() => setIsAddDialogOpen(true)} />
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio Venta</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Fecha Venta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unidades.map((unidad) => (
                <UnidadTableRow 
                  key={unidad.id}
                  unidad={unidad}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Unidad Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !isSubmitting) setIsAddDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Agregar Unidad</DialogTitle>
          <DialogDescription>Ingresa los datos de la nueva unidad</DialogDescription>
          {isAddDialogOpen && (
            <UnidadForm 
              onSubmit={handleAddUnidad}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={isSubmitting}
              leads={leads || []}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Unidad Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setIsEditDialogOpen(false);
            setTimeout(() => setCurrentUnidad(null), 300);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Editar Unidad</DialogTitle>
          <DialogDescription>Modifica los datos de la unidad</DialogDescription>
          {isEditDialogOpen && currentUnidad && (
            <UnidadForm 
              unidad={currentUnidad}
              onSubmit={handleEditUnidad}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isSubmitting}
              leads={leads || []}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteUnidadDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => !isSubmitting && setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUnidad}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default UnidadTable;
