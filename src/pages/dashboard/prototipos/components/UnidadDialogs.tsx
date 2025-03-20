
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DeleteUnidadDialog from './DeleteUnidadDialog';
import SellUnidadDialog from './SellUnidadDialog';
import { UnidadForm } from "../UnidadForm";

interface UnidadDialogsProps {
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isSellDialogOpen: boolean;
  isSubmitting: boolean;
  currentUnidad: any;
  leads: any[];
  setIsAddDialogOpen: (open: boolean) => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;
  closeSellDialog: () => void;
  handleAddUnidad: (data: any) => Promise<void>;
  handleEditUnidad: (data: any) => Promise<void>;
  handleDeleteUnidad: () => Promise<void>;
  handleSellUnidad: () => Promise<void>;
}

export const UnidadDialogs = ({
  isAddDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  isSellDialogOpen,
  isSubmitting,
  currentUnidad,
  leads,
  setIsAddDialogOpen,
  closeEditDialog,
  closeDeleteDialog,
  closeSellDialog,
  handleAddUnidad,
  handleEditUnidad,
  handleDeleteUnidad,
  handleSellUnidad
}: UnidadDialogsProps) => {
  // Función para prevenir cierres mientras se está enviando
  const safeCloseAddDialog = () => {
    if (!isSubmitting) setIsAddDialogOpen(false);
  };

  return (
    <>
      {/* Add Unidad Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={open => {
          if (!open && !isSubmitting) safeCloseAddDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Agregar Unidad</DialogTitle>
          <DialogDescription>Ingresa los datos de la nueva unidad</DialogDescription>
          {isAddDialogOpen && (
            <UnidadForm 
              onSubmit={handleAddUnidad}
              onCancel={safeCloseAddDialog}
              leads={leads || []}
              isSubmitting={isSubmitting}
              simplifiedForm={true}
            />
          )}
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
              simplifiedForm={true}
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

      {/* Sell Confirmation Dialog */}
      <SellUnidadDialog
        isOpen={isSellDialogOpen}
        onClose={closeSellDialog}
        onConfirm={handleSellUnidad}
        isProcessing={isSubmitting}
        unidadNumero={currentUnidad?.numero}
      />
    </>
  );
};

export default UnidadDialogs;
