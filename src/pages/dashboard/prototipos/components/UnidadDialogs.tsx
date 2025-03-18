
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DeleteUnidadDialog from './DeleteUnidadDialog';
import { UnidadForm } from "../UnidadForm";

interface UnidadDialogsProps {
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  currentUnidad: any;
  leads: any[];
  setIsAddDialogOpen: (open: boolean) => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;
  handleAddUnidad: (data: any) => void;
  handleEditUnidad: (data: any) => void;
  handleDeleteUnidad: () => void;
}

export const UnidadDialogs = ({
  isAddDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  currentUnidad,
  leads,
  setIsAddDialogOpen,
  closeEditDialog,
  closeDeleteDialog,
  handleAddUnidad,
  handleEditUnidad,
  handleDeleteUnidad
}: UnidadDialogsProps) => {
  // Handle form submission with a delay to avoid UI freezing
  const handleAddSubmit = (data: any) => {
    // Close dialog first
    setIsAddDialogOpen(false);
    // Process the data after a small delay
    setTimeout(() => {
      handleAddUnidad(data);
    }, 100);
  };
  
  const handleEditSubmit = (data: any) => {
    // Close dialog first
    closeEditDialog();
    // Process the data after a small delay
    setTimeout(() => {
      handleEditUnidad(data);
    }, 100);
  };

  return (
    <>
      {/* Add Unidad Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Agregar Unidad</DialogTitle>
          <DialogDescription>Ingresa los datos de la nueva unidad</DialogDescription>
          <UnidadForm 
            onSubmit={handleAddSubmit}
            onCancel={() => setIsAddDialogOpen(false)}
            leads={leads}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Unidad Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Editar Unidad</DialogTitle>
          <DialogDescription>Modifica los datos de la unidad</DialogDescription>
          {currentUnidad && (
            <UnidadForm 
              unidad={currentUnidad}
              onSubmit={handleEditSubmit}
              onCancel={closeEditDialog}
              leads={leads}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteUnidadDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteUnidad}
      />
    </>
  );
};

export default UnidadDialogs;
