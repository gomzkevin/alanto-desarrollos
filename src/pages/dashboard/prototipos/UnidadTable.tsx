
import React, { useState, useEffect } from 'react';
import { Table, TableBody } from "@/components/ui/table";
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import UnidadTableHeader from './components/UnidadTableHeader';
import UnidadTableRow from './components/UnidadTableRow';
import EmptyUnidadState from './components/EmptyUnidadState';
import UnidadDialogs from './components/UnidadDialogs';
import useUnidadTable from './hooks/useUnidadTable';
import UnidadTableActions from './components/UnidadTableActions';

export interface UnidadTableProps {
  prototipo: ExtendedPrototipo;
  unidades: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const UnidadTable = ({ 
  prototipo, 
  unidades: externalUnidades, 
  isLoading: externalLoading, 
  onRefresh: externalRefresh 
}: UnidadTableProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Use a ref to store the current unidades to prevent unnecessary re-renders
  const [stableUnidades, setStableUnidades] = useState([]);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Update stable unidades only when externalUnidades changes
  useEffect(() => {
    if (externalUnidades && Array.isArray(externalUnidades)) {
      setStableUnidades(externalUnidades);
    }
  }, [externalUnidades]);
  
  const {
    unidades,
    isLoading,
    leads,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    currentUnidad,
    isProcessing,
    setIsAddDialogOpen,
    openEditDialog,
    openDeleteDialog,
    closeEditDialog,
    closeDeleteDialog,
    handleAddUnidad,
    handleEditUnidad,
    handleDeleteUnidad
  } = useUnidadTable({
    prototipo,
    externalUnidades: stableUnidades,
    externalLoading,
    externalRefresh
  });
  
  // Handle loading state more effectively
  useEffect(() => {
    if (isProcessing && isMounted) {
      setLocalLoading(true);
    } else if (!isProcessing && isMounted) {
      const timer = setTimeout(() => {
        if (isMounted) {
          setLocalLoading(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isMounted]);
  
  const finalIsLoading = externalLoading || localLoading;

  // Simple loading state display
  if (finalIsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Cargando unidades...</span>
      </div>
    );
  }

  // Ensure we're rendering a stable array of units
  const displayUnidades = Array.isArray(unidades) ? unidades : [];
  const hasUnidades = displayUnidades.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Unidades de {prototipo.nombre}</h2>
        
        <UnidadTableActions 
          onAddClick={() => !isProcessing && setIsAddDialogOpen(true)}
          unidadesCount={displayUnidades.length}
          totalUnidades={prototipo.total_unidades}
          showGenerateButton={false}
        />
      </div>
      
      {!hasUnidades ? (
        <EmptyUnidadState onAddClick={() => !isProcessing && setIsAddDialogOpen(true)} />
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <UnidadTableHeader />
            <TableBody>
              {displayUnidades.map((unidad) => (
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
      
      <UnidadDialogs
        isAddDialogOpen={isAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
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

export default UnidadTable;
