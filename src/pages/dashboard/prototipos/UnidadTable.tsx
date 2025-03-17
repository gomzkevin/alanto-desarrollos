
import React from 'react';
import { Button } from "@/components/ui/button";
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
  const {
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
  } = useUnidadTable({
    prototipo,
    externalUnidades,
    externalLoading,
    externalRefresh
  });

  if (isLoading) {
    return <div className="text-center py-4">Cargando unidades...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Unidades de {prototipo.nombre}</h2>
        <UnidadTableActions 
          onAddClick={() => setIsAddDialogOpen(true)}
          unidadesCount={unidades.length}
          totalUnidades={prototipo.total_unidades || 0}
        />
      </div>
      
      {unidades.length === 0 ? (
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
