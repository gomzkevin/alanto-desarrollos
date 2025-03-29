
import React, { useState, useCallback } from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import UnidadTableRow from './components/UnidadTableRow';
import UnidadTableHeader from './components/UnidadTableHeader';
import EmptyUnidadState from './components/EmptyUnidadState';
import UnidadDialogs from './components/UnidadDialogs';
import { useToast } from "@/hooks/use-toast";
import useLeads from "@/hooks/useLeads";
import useUnidades from '@/hooks/useUnidades';
import useUnitSale from '@/hooks/useUnitSale';

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
  const { createUnidad, updateUnidad, deleteUnidad, refetch } = useUnidades({ prototipo_id: prototipo.id });
  const { createSaleAndRedirect, isLoading: isCreatingSale } = useUnitSale();
  
  // Estados simplificados
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refrescar datos
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      refetch();
    }
  }, [onRefresh, refetch]);

  // Agregar unidad
  const handleAddUnidad = useCallback(async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createUnidad({
        prototipo_id: prototipo.id,
        numero: data.numero,
        estado: data.estado || 'disponible',
        nivel: data.nivel
      });
      
      toast({
        title: "Unidad creada",
        description: "La unidad ha sido creada exitosamente"
      });
      
      setIsAddDialogOpen(false);
      handleRefresh();
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
  }, [createUnidad, handleRefresh, prototipo.id, toast, isSubmitting]);

  // Editar unidad
  const handleEditUnidad = useCallback(async (data: any) => {
    if (!currentUnidad || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const unidadId = currentUnidad.id;
      
      await updateUnidad({
        id: unidadId,
        numero: data.numero,
        estado: data.estado || 'disponible',
        nivel: data.nivel
      });
      
      toast({
        title: "Unidad actualizada",
        description: "La unidad ha sido actualizada exitosamente"
      });
      
      setIsEditDialogOpen(false);
      setCurrentUnidad(null);
      handleRefresh();
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
  }, [currentUnidad, handleRefresh, toast, updateUnidad, isSubmitting]);

  // Eliminar unidad
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
      
      setIsDeleteDialogOpen(false);
      setCurrentUnidad(null);
      handleRefresh();
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
  }, [currentUnidad, deleteUnidad, handleRefresh, toast, isSubmitting]);

  // Vender unidad
  const handleSellUnidad = useCallback(async () => {
    if (!currentUnidad) return;
    
    try {
      await createSaleAndRedirect(currentUnidad);
      setIsSellDialogOpen(false);
      setCurrentUnidad(null);
    } catch (error) {
      console.error("Error en proceso de venta:", error);
    }
  }, [currentUnidad, createSaleAndRedirect]);

  // Funciones para abrir dialogs
  const openEditDialog = useCallback((unidad: any) => {
    if (isSubmitting || isCreatingSale) return;
    setCurrentUnidad(unidad);
    setIsEditDialogOpen(true);
  }, [isSubmitting, isCreatingSale]);

  const openDeleteDialog = useCallback((unidad: any) => {
    if (isSubmitting || isCreatingSale) return;
    setCurrentUnidad(unidad);
    setIsDeleteDialogOpen(true);
  }, [isSubmitting, isCreatingSale]);

  const openSellDialog = useCallback((unidad: any) => {
    if (isSubmitting || isCreatingSale) return;
    setCurrentUnidad(unidad);
    setIsSellDialogOpen(true);
  }, [isSubmitting, isCreatingSale]);
  
  // Funciones para cerrar dialogs
  const closeEditDialog = useCallback(() => {
    if (isSubmitting) return;
    setIsEditDialogOpen(false);
    setTimeout(() => setCurrentUnidad(null), 300);
  }, [isSubmitting]);
  
  const closeDeleteDialog = useCallback(() => {
    if (isSubmitting) return;
    setIsDeleteDialogOpen(false);
    setTimeout(() => setCurrentUnidad(null), 300);
  }, [isSubmitting]);

  const closeSellDialog = useCallback(() => {
    if (isCreatingSale) return;
    setIsSellDialogOpen(false);
    setTimeout(() => setCurrentUnidad(null), 300);
  }, [isCreatingSale]);

  // Renderizar estado de carga si es necesario
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
      {/* Tabla o estado vacío */}
      {!unidades || unidades.length === 0 ? (
        <EmptyUnidadState onAddClick={() => setIsAddDialogOpen(true)} />
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <UnidadTableHeader />
            <TableBody>
              {unidades.map((unidad) => (
                <UnidadTableRow 
                  key={unidad.id}
                  unidad={unidad}
                  onEdit={openEditDialog}
                  onSell={openSellDialog}
                  isDisabled={isSubmitting || isCreatingSale}
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
          disabled={isSubmitting || isCreatingSale}
        >
          Agregar Unidad
        </button>
      </div>
      
      {/* Diálogos */}
      <UnidadDialogs
        isAddDialogOpen={isAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isSellDialogOpen={isSellDialogOpen}
        isSubmitting={isSubmitting || isCreatingSale}
        currentUnidad={currentUnidad}
        leads={leads}
        setIsAddDialogOpen={setIsAddDialogOpen}
        closeEditDialog={closeEditDialog}
        closeDeleteDialog={closeDeleteDialog}
        closeSellDialog={closeSellDialog}
        handleAddUnidad={handleAddUnidad}
        handleEditUnidad={handleEditUnidad}
        handleDeleteUnidad={handleDeleteUnidad}
        handleSellUnidad={handleSellUnidad}
      />
    </div>
  );
};

UnidadTable.displayName = 'UnidadTable';

export default React.memo(UnidadTable);
