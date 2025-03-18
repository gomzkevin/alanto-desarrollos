
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
  // First close dialog then process the data
  const handleAddSubmit = (data: any) => {
    // Close dialog first
    setIsAddDialogOpen(false);
    
    // Process data with a delay to ensure dialog is closed
    setTimeout(() => {
      handleAddUnidad(data);
    }, 300);
  };
  
  const handleEditSubmit = (data: any) => {
    // Close dialog first
    closeEditDialog();
    
    // Process data with a delay to ensure dialog is closed
    setTimeout(() => {
      handleEditUnidad(data);
    }, 300);
  };

  return (
    <>
      {/* Add Unidad Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          if (!open) setIsAddDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Agregar Unidad</DialogTitle>
          <DialogDescription>Ingresa los datos de la nueva unidad</DialogDescription>
          {isAddDialogOpen && (
            <UnidadForm 
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddDialogOpen(false)}
              leads={leads}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Unidad Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Editar Unidad</DialogTitle>
          <DialogDescription>Modifica los datos de la unidad</DialogDescription>
          {isEditDialogOpen && currentUnidad && (
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
        onConfirm={() => {
          closeDeleteDialog();
          setTimeout(() => {
            handleDeleteUnidad();
          }, 300);
        }}
      />
    </>
  );
};

export default UnidadDialogs;
