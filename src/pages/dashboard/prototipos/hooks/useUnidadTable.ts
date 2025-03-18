
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

  const handleAddUnidad = useCallback(async (data: any) => {
    try {
      // Convert price from string to number if needed
      const precioVenta = typeof data.precio_venta === 'string' && data.precio_venta.includes('$')
        ? parseFloat(data.precio_venta.replace(/[$,]/g, ''))
        : data.precio_venta;

      await createUnidad({
        prototipo_id: prototipo.id,
        numero: data.numero,
        estado: data.estado,
        nivel: data.nivel,
        precio_venta: precioVenta,
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
      
      // Convert price from string to number if needed
      const precioVenta = typeof data.precio_venta === 'string' && data.precio_venta.includes('$')
        ? parseFloat(data.precio_venta.replace(/[$,]/g, ''))
        : data.precio_venta;
      
      await updateUnidad({
        id: currentUnidad.id,
        numero: data.numero,
        estado: data.estado,
        nivel: data.nivel,
        precio_venta: precioVenta,
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
      
      setCurrentUnidad(null);
      // Wait a brief moment before refreshing to avoid race conditions
      setTimeout(() => {
        refetch();
      }, 100);
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
      
      await deleteUnidad(currentUnidad.id);
      
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente"
      });
      
      setCurrentUnidad(null);
      // Wait a brief moment before refreshing
      setTimeout(() => {
        refetch();
      }, 100);
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
