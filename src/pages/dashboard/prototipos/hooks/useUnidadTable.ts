
import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import useUnidades from "@/hooks/useUnidades";
import useLeads from "@/hooks/useLeads";
import { ExtendedPrototipo } from '@/hooks/usePrototipos';

interface UseUnidadTableProps {
  prototipo: ExtendedPrototipo;
  externalUnidades?: any[];
  externalLoading?: boolean;
  externalRefresh?: () => void;
}

export const useUnidadTable = ({ 
  prototipo, 
  externalUnidades, 
  externalLoading, 
  externalRefresh 
}: UseUnidadTableProps) => {
  const { toast } = useToast();
  const { 
    unidades: hookUnidades, 
    isLoading: hookLoading, 
    createUnidad, 
    updateUnidad, 
    deleteUnidad, 
    refetch: hookRefresh 
  } = useUnidades({ prototipo_id: prototipo.id });
  
  const { leads } = useLeads();
  
  // Use either the external or hook data
  const unidades = externalUnidades || hookUnidades;
  const isLoading = externalLoading !== undefined ? externalLoading : hookLoading;
  const refetch = externalRefresh || hookRefresh;
  
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState<any>(null);
  
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
        prototipo_id: prototipo.id,
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
  }, [prototipo.id, createUnidad, toast, refetch]);

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

  const openEditDialog = useCallback((unidad: any) => {
    setCurrentUnidad(unidad);
    setIsEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((unidad: any) => {
    setCurrentUnidad(unidad);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setCurrentUnidad(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setCurrentUnidad(null);
  }, []);

  return {
    unidades,
    isLoading,
    leads,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    currentUnidad,
    setIsAddDialogOpen,
    openEditDialog,
    openDeleteDialog,
    closeEditDialog,
    closeDeleteDialog,
    handleAddUnidad,
    handleEditUnidad,
    handleDeleteUnidad
  };
};

export default useUnidadTable;
