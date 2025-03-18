
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
      // Clean up when component unmounts
      setCurrentUnidad(null);
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setIsDeleteDialogOpen(false);
    };
  }, []);

  // Helper function to normalize price
  const normalizePrice = (price: any): number | undefined => {
    if (price === undefined || price === null) return undefined;
    
    if (typeof price === 'string') {
      // Remove currency symbols and commas
      return parseFloat(price.replace(/[$,]/g, ''));
    }
    
    return Number(price);
  };

  const handleAddUnidad = useCallback(async (data: any) => {
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
      
      // First close the dialog
      setIsAddDialogOpen(false);
      
      toast({
        title: "Unidad creada",
        description: "La unidad ha sido creada exitosamente"
      });
      
      // Wait a moment before refreshing to avoid freezing
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error: any) {
      console.error("Error creating unidad:", error);
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
      // Make sure we close the dialog first before potentially causing any state update issues
      setIsEditDialogOpen(false);
      const unidadId = currentUnidad.id;
      setCurrentUnidad(null);
      
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
      
      // Wait a bit before refreshing to avoid race conditions
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error: any) {
      console.error("Error updating unidad:", error);
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
      // Close dialog first
      setIsDeleteDialogOpen(false);
      const unidadId = currentUnidad.id;
      setCurrentUnidad(null);
      
      await deleteUnidad(unidadId);
      
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente"
      });
      
      // Wait before refreshing
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (error: any) {
      console.error("Error deleting unidad:", error);
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
    // Wait a bit before clearing the current unidad to avoid UI flicker
    setTimeout(() => {
      setCurrentUnidad(null);
    }, 100);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    // Wait a bit before clearing the current unidad to avoid UI flicker
    setTimeout(() => {
      setCurrentUnidad(null);
    }, 100);
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
