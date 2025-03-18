
import React, { useState, useEffect } from 'react';
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
  // Track whether form should be visible to prevent rendering issues
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  // Update form visibility with a slight delay to prevent UI flicker
  useEffect(() => {
    let addTimer: number | undefined;
    let editTimer: number | undefined;
    
    if (isAddDialogOpen) {
      addTimer = window.setTimeout(() => setShowAddForm(true), 100);
    } else {
      setShowAddForm(false);
    }
    
    if (isEditDialogOpen) {
      editTimer = window.setTimeout(() => setShowEditForm(true), 100);
    } else {
      setShowEditForm(false);
    }
    
    return () => {
      if (addTimer) clearTimeout(addTimer);
      if (editTimer) clearTimeout(editTimer);
    };
  }, [isAddDialogOpen, isEditDialogOpen]);
  
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
          {showAddForm && (
            <UnidadForm 
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddDialogOpen(false)}
              leads={leads || []}
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
          {showEditForm && currentUnidad && (
            <UnidadForm 
              unidad={currentUnidad}
              onSubmit={handleEditSubmit}
              onCancel={closeEditDialog}
              leads={leads || []}
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
