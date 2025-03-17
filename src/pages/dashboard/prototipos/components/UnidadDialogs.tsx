
import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  return (
    <>
      {/* Add Unidad Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <UnidadForm 
            onSubmit={handleAddUnidad}
            onCancel={() => setIsAddDialogOpen(false)}
            leads={leads}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Unidad Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-md">
          {currentUnidad && (
            <UnidadForm 
              unidad={currentUnidad}
              onSubmit={handleEditUnidad}
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
