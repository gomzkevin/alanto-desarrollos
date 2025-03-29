
import React, { useCallback, useMemo } from 'react';
import { Table, TableBody, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import EmptyUnidadState from './components/EmptyUnidadState';
import UnidadTableHeader from './components/UnidadTableHeader';
import UnidadTableRow from './components/UnidadTableRow';
import UnidadDialogs from './components/UnidadDialogs';
import useUnidadTable from './hooks/useUnidadTable';

interface UnidadTableProps {
  prototipo: ExtendedPrototipo;
  unidades: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const UnidadTable = React.memo(({
  prototipo,
  unidades = [],
  isLoading = false,
  onRefresh
}: UnidadTableProps) => {
  const {
    leads,
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isSellDialogOpen,
    currentUnidad,
    isProcessing,
    setIsAddDialogOpen,
    openEditDialog,
    openDeleteDialog,
    openSellDialog,
    closeEditDialog,
    closeDeleteDialog,
    closeSellDialog,
    handleAddUnidad,
    handleEditUnidad,
    handleDeleteUnidad,
    handleSellUnidad
  } = useUnidadTable({ 
    prototipo, 
    externalUnidades: unidades, 
    externalLoading: isLoading,
    externalRefresh: onRefresh
  });
  
  // Usar memo para evitar recálculos innecesarios
  const sortedUnidades = useMemo(() => {
    if (!unidades || unidades.length === 0) return [];
    
    // Ordenar primero por nivel (si existe) y luego por número
    return [...unidades].sort((a, b) => {
      // Si ambos tienen nivel, ordenar por nivel primero
      if (a.nivel && b.nivel) {
        const nivelComparison = a.nivel.localeCompare(b.nivel);
        if (nivelComparison !== 0) return nivelComparison;
      }
      
      // Si niveles son iguales o no existen, ordenar por número
      const aNum = parseInt(a.numero.toString().replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.numero.toString().replace(/\D/g, '')) || 0;
      
      return aNum - bNum;
    });
  }, [unidades]);

  // Manejador para actualizar unidades
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);
  
  // Manejador para añadir unidad (para el EmptyState)
  const handleAddClick = useCallback(() => {
    setIsAddDialogOpen(true);
  }, [setIsAddDialogOpen]);

  // Si no hay unidades, mostrar estado vacío
  if (!isLoading && (!sortedUnidades || sortedUnidades.length === 0)) {
    return <EmptyUnidadState onAddClick={handleAddClick} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          type="button"
        >
          <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHead>
            <UnidadTableHeader />
          </TableHead>
          <TableBody>
            {sortedUnidades.map((unidad) => (
              <UnidadTableRow 
                key={unidad.id}
                unidad={unidad}
                onEdit={openEditDialog}
                onSell={openSellDialog}
                isDisabled={isProcessing}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      
      <UnidadDialogs 
        isAddDialogOpen={isAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        isDeleteDialogOpen={isDeleteDialogOpen}
        isSellDialogOpen={isSellDialogOpen}
        isSubmitting={isProcessing}
        currentUnidad={currentUnidad}
        leads={leads || []}
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
});

UnidadTable.displayName = 'UnidadTable';

export default UnidadTable;
