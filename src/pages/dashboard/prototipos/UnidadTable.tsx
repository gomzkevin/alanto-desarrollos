
import React, { useState, useCallback, useMemo } from 'react';
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import UnidadTableRow from './components/UnidadTableRow';
import EmptyUnidadState from './components/EmptyUnidadState';
import UnidadDialogs from './components/UnidadDialogs';
import { useToast } from "@/hooks/use-toast";
import useLeads from "@/hooks/useLeads";
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
  const { leads = [] } = useLeads();
  const { 
    createUnidad, 
    updateUnidad, 
    deleteUnidad
  } = useUnidades({ prototipo_id: prototipo.id });
  
  // Dialog state - using separate state variables to prevent issues
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Normalize price with a stable reference
  const normalizePrice = useCallback((price: any): number | undefined => {
    if (price === undefined || price === null) return undefined;
    
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[$,]/g, ''));
    }
    
    return Number(price);
  }, []);

  // Create unidad handler with proper cleanup
  const handleAddUnidad = useCallback(async (data: any) => {
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
      
      // Safe state updates
      setIsAddDialogOpen(false);
      
      if (onRefresh) {
        setTimeout(onRefresh, 300);
      }
    } catch (error: any) {
      console.error("Error creating unidad:", error);
      toast({
        title: "Error",
        description: `No se pudo crear la unidad: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      // Ensure we reset submission state
      setTimeout(() => setIsSubmitting(false), 100);
    }
  }, [createUnidad, normalizePrice, onRefresh, prototipo.id, toast, isSubmitting]);

  // Edit unidad handler with proper cleanup
  const handleEditUnidad = useCallback(async (data: any) => {
    if (!currentUnidad || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const unidadId = currentUnidad.id;
      
      await updateUnidad({
        id: unidadId,
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
      
      // Close dialog first, then clear state
      setIsEditDialogOpen(false);
      
      // Safe cleanup with timeouts
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
          // Clear the current unidad after refreshing
          setTimeout(() => setCurrentUnidad(null), 100);
        }, 300);
      } else {
        setTimeout(() => setCurrentUnidad(null), 300);
      }
    } catch (error: any) {
      console.error("Error updating unidad:", error);
      toast({
        title: "Error",
        description: `No se pudo actualizar la unidad: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      // Reset submission state with delay
      setTimeout(() => setIsSubmitting(false), 100);
    }
  }, [currentUnidad, normalizePrice, onRefresh, toast, updateUnidad, isSubmitting]);

  // Delete unidad handler with proper cleanup
  const handleDeleteUnidad = useCallback(async () => {
    if (!currentUnidad || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const unidadId = currentUnidad.id;
      await deleteUnidad(unidadId);
      
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente"
      });
      
      // Close dialog first
      setIsDeleteDialogOpen(false);
      
      // Safe cleanup with timeouts
      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
          // Clear after refreshing
          setTimeout(() => setCurrentUnidad(null), 100);
        }, 300);
      } else {
        setTimeout(() => setCurrentUnidad(null), 300);
      }
    } catch (error: any) {
      console.error("Error deleting unidad:", error);
      toast({
        title: "Error",
        description: `No se pudo eliminar la unidad: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      // Reset submission state with delay
      setTimeout(() => setIsSubmitting(false), 100);
    }
  }, [currentUnidad, deleteUnidad, onRefresh, toast, isSubmitting]);

  // Dialog open handlers with stable references
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
  
  // Dialog close handlers with proper cleanup
  const closeAddDialog = useCallback(() => {
    if (isSubmitting) return;
    setIsAddDialogOpen(false);
  }, [isSubmitting]);

  const closeEditDialog = useCallback(() => {
    if (isSubmitting) return;
    setIsEditDialogOpen(false);
    // Clear current unidad with delay
    setTimeout(() => setCurrentUnidad(null), 300);
  }, [isSubmitting]);
  
  const closeDeleteDialog = useCallback(() => {
    if (isSubmitting) return;
    setIsDeleteDialogOpen(false);
    // Clear current unidad with delay
    setTimeout(() => setCurrentUnidad(null), 300);
  }, [isSubmitting]);

  // Memoize empty state check to prevent re-renders
  const hasUnidades = useMemo(() => 
    unidades && unidades.length > 0, 
    [unidades]
  );

  // Render loading state if explicitly requested
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-3 text-slate-600">Cargando unidades...</span>
      </div>
    );
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
      
      {/* Botón agregar unidad */}
      <div className="flex justify-end">
        <button
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={isSubmitting}
        >
          Agregar Unidad
        </button>
      </div>
      
      {/* All dialogs extracted to a separate component */}
      <UnidadDialogs
        isAddDialogOpen={isAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isSubmitting={isSubmitting}
        currentUnidad={currentUnidad}
        leads={leads}
        setIsAddDialogOpen={setIsAddDialogOpen}
        closeEditDialog={closeEditDialog}
        closeDeleteDialog={closeDeleteDialog}
        handleAddUnidad={handleAddUnidad}
        handleEditUnidad={handleEditUnidad}
        handleDeleteUnidad={handleDeleteUnidad}
      />
    </div>
  );
};

UnidadTable.displayName = 'UnidadTable';

export default React.memo(UnidadTable);
