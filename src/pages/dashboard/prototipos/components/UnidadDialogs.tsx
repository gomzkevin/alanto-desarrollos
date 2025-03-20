
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DeleteUnidadDialog from './DeleteUnidadDialog';
import { UnidadForm } from "../UnidadForm";

interface UnidadDialogsProps {
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isSubmitting: boolean;
  currentUnidad: any;
  leads: any[];
  setIsAddDialogOpen: (open: boolean) => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;
  handleAddUnidad: (data: any) => Promise<void>;
  handleEditUnidad: (data: any) => Promise<void>;
  handleDeleteUnidad: () => Promise<void>;
}

export const UnidadDialogs = ({
  isAddDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  isSubmitting,
  currentUnidad,
  leads,
  setIsAddDialogOpen,
  closeEditDialog,
  closeDeleteDialog,
  handleAddUnidad,
  handleEditUnidad,
  handleDeleteUnidad
}: UnidadDialogsProps) => {
  // Función simple para prevenir cierres mientras se está enviando
  const safeCloseAddDialog = () => {
    if (!isSubmitting) setIsAddDialogOpen(false);
  };

  return (
    <>
      {/* Add Unidad Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={open => {
          if (!open) safeCloseAddDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Agregar Unidad</DialogTitle>
          <DialogDescription>Ingresa los datos de la nueva unidad</DialogDescription>
          <UnidadForm 
            onSubmit={handleAddUnidad}
            onCancel={safeCloseAddDialog}
            leads={leads || []}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Unidad Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={open => {
          if (!open && !isSubmitting) closeEditDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Editar Unidad</DialogTitle>
          <DialogDescription>Modifica los datos de la unidad</DialogDescription>
          {isEditDialogOpen && currentUnidad && (
            <UnidadForm 
              unidad={currentUnidad}
              onSubmit={handleEditUnidad}
              onCancel={closeEditDialog}
              leads={leads || []}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <DeleteUnidadDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteUnidad}
        isDeleting={isSubmitting}
      />
    </>
  );
};

export default UnidadDialogs;
