
import React, { useState, useCallback, useMemo } from 'react';
import { Table, TableBody, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import UnidadTableRow from './components/UnidadTableRow';
import EmptyUnidadState from './components/EmptyUnidadState';
import UnidadDialogs from './components/UnidadDialogs';
import UnidadSaleAlert from './components/UnidadSaleAlert';
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
  const { 
    createUnidad, 
    updateUnidad, 
    deleteUnidad
  } = useUnidades({ prototipo_id: prototipo.id });
  
  // Estados simplificados
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUnidad, setCurrentUnidad] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para la alerta de venta creada
  const [showSaleAlert, setShowSaleAlert] = useState(false);
  const [editedUnidadId, setEditedUnidadId] = useState<string | undefined>(undefined);
  const { ventaId } = useUnitSale(editedUnidadId);
  
  // Función para normalizar precios
  const normalizePrice = useCallback((price: any): number | undefined => {
    if (price === undefined || price === null) return undefined;
    
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^0-9]/g, ''));
    }
    
    return Number(price);
  }, []);

  // Agregar unidad - simplificado
  const handleAddUnidad = useCallback(async (data: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      console.log('Creando unidad con datos:', data);
      
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
      
      if (onRefresh) {
        setTimeout(onRefresh, 500);
      }
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
  }, [createUnidad, normalizePrice, onRefresh, prototipo.id, toast, isSubmitting]);

  // Editar unidad - simplificado
  const handleEditUnidad = useCallback(async (data: any) => {
    if (!currentUnidad || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const unidadId = currentUnidad.id;
      const prevEstado = currentUnidad.estado;
      const newEstado = data.estado;
      
      console.log('Actualizando unidad:', {
        id: unidadId,
        estadoPrevio: prevEstado,
        estadoNuevo: newEstado,
        data
      });
      
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
      
      setIsEditDialogOpen(false);
      
      // Check if a sale might have been created
      const possibleSaleCreation = 
        (prevEstado === 'disponible') && 
        (newEstado === 'apartado' || newEstado === 'en_proceso');
      
      if (possibleSaleCreation) {
        setEditedUnidadId(unidadId);
      }
      
      if (onRefresh) {
        setTimeout(onRefresh, 500);
      }
      
      setTimeout(() => {
        setCurrentUnidad(null);
        
        if (possibleSaleCreation && ventaId) {
          setShowSaleAlert(true);
          // Auto-hide after some time
          setTimeout(() => {
            setShowSaleAlert(false);
            setEditedUnidadId(undefined);
          }, 8000);
        }
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
  }, [currentUnidad, normalizePrice, onRefresh, toast, updateUnidad, isSubmitting, ventaId]);

  // Eliminar unidad - simplificado
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
      
      if (onRefresh) {
        setTimeout(onRefresh, 500);
      }
      
      setTimeout(() => {
        setCurrentUnidad(null);
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
  }, [currentUnidad, deleteUnidad, onRefresh, toast, isSubmitting]);

  // Funciones para abrir dialogs
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

  // Verificar si hay unidades
  const hasUnidades = useMemo(() => 
    unidades && unidades.length > 0, 
    [unidades]
  );

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
      {/* Alerta de creación de venta */}
      <UnidadSaleAlert 
        isVisible={showSaleAlert}
        unidadId={editedUnidadId}
        ventaId={ventaId}
        onClose={() => setShowSaleAlert(false)}
      />
      
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
      
      {/* Diálogos */}
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
