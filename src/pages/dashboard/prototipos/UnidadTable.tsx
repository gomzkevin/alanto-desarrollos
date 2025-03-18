
import React, { useState, useCallback } from 'react';
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

export const UnidadTable: React.FC<UnidadTableProps> = React.memo(({ 
  prototipo, 
  unidades = [], 
  isLoading = false,
  onRefresh
}) => {
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
    if (isSubmitting) return;
    
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
      
      // Esperar antes de refrescar
      setTimeout(() => {
        if (onRefresh) onRefresh();
      }, 1000);
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
    if (!currentUnidad || isSubmitting) return;
    
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
      
      // Esperar antes de refrescar y limpiar el unidad actual
      setTimeout(() => {
        setCurrentUnidad(null);
        if (onRefresh) onRefresh();
      }, 1000);
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
    if (!currentUnidad || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await deleteUnidad(currentUnidad.id);
      
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente"
      });
      
      setIsDeleteDialogOpen(false);
      
      // Esperar antes de refrescar y limpiar el unidad actual
      setTimeout(() => {
        setCurrentUnidad(null);
        if (onRefresh) onRefresh();
      }, 1000);
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
  const openEditDialog = useCallback((unidad: any) => {
    if (isSubmitting) return;
    setCurrentUnidad(unidad);
    setIsEditDialogOpen(true);
  }, [isSubmitting]);

  const openDeleteDialog = useCallback((unidad: any) => {
    if (isSubmitting) return;
    setCurrentUnidad(unidad);
    setIsDeleteDialogOpen(true);
  }, [isSubmitting]);

  // Check for empty state
  const hasUnidades = unidades && unidades.length > 0;

  if (isLoading) {
    return null; // No renderizar nada si está cargando, el componente padre se encarga de esto
  }

  return (
    <div className="space-y-4">
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
      
      {/* Botón agregar unidad - solo se muestra si no está cargando */}
      <div className="flex justify-end">
        <button
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={isSubmitting}
        >
          Agregar Unidad
        </button>
      </div>
      
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
              onCancel={() => !isSubmitting && setIsAddDialogOpen(false)}
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
            // Esperar a que la transición de cierre termine antes de limpiar el unidad
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
              onCancel={() => !isSubmitting && setIsEditDialogOpen(false)}
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
});

UnidadTable.displayName = 'UnidadTable';

export default UnidadTable;
