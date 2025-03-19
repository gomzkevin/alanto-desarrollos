
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ResourceDialogProps } from './types';
import { ResourceDialogContent } from './components/ResourceDialogContent';
import useResourceData from './useResourceData';
import useResourceActions from './useResourceActions';
import { useResourceFields } from './hooks/useResourceFields';
import { useResourceForm } from './hooks/useResourceForm';

const ResourceDialog: React.FC<ResourceDialogProps> = ({
  open = false,
  onClose,
  resourceType,
  resourceId,
  onSuccess,
  desarrolloId,
  lead_id,
  prototipo_id
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isExistingClient, setIsExistingClient] = useState<boolean>(true);
  const [newClientData, setNewClientData] = useState<{ nombre: string; email: string; telefono: string }>({
    nombre: '',
    email: '',
    telefono: ''
  });
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(desarrolloId || null);
  const [usarFiniquito, setUsarFiniquito] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const { fields, selectedStatus: statusFromFields } = useResourceFields(resourceType, selectedStatus, selectedDesarrolloId || undefined);
  
  const resourceDataProps = {
    resourceType,
    resourceId,
    desarrolloId,
    lead_id,
    selectedDesarrolloId,
    selectedStatus,
    usarFiniquito,
    selectedAmenities,
    onStatusChange: setSelectedStatus,
    onAmenitiesChange: setSelectedAmenities
  };
  
  const { resource, isLoading } = useResourceData(resourceDataProps);

  const resourceActionsProps = {
    resourceType,
    resourceId,
    onSuccess,
    selectedAmenities,
    clientConfig: {
      isExistingClient,
      newClientData
    }
  };

  const {
    isLoading: isSubmitting,
    saveResource: handleSaveResource,
    handleImageUpload
  } = useResourceActions(resourceActionsProps);

  const resourceFormProps = {
    resourceType,
    resourceId,
    desarrolloId: selectedDesarrolloId || undefined,
    lead_id,
    prototipo_id,
    onSuccess,
  };

  const {
    resource: formValues,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleLeadSelect,
    handleDateChange,
    handleAmenitiesChange,
    saveResource
  } = useResourceForm(resourceFormProps);
  
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };
  
  const handleFormSubmit = async () => {
    return await saveResource();
  };

  const handleExistingClientChange = (isExisting: boolean) => {
    setIsExistingClient(isExisting);
  };

  const handleNewClientDataChange = (field: string, value: string) => {
    setNewClientData({
      ...newClientData,
      [field]: value
    });
  };

  const handleAmenitiesChangeWrapper = (amenities: string[]) => {
    setSelectedAmenities(amenities);
    if (handleAmenitiesChange) {
      handleAmenitiesChange(amenities);
    }
  };

  // Wrapper function to handle file upload from HTML input
  const adaptedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const file = e.target.files[0];
        // Use default bucket and folder names
        const bucket = 'prototipo-images';
        const folder = resourceType === 'desarrollos' ? 'desarrollos' : 'prototipos';
        const fieldName = 'imagen_url';
        
        const imageUrl = await handleImageUpload(file, bucket, folder, fieldName);
        
        if (imageUrl && handleChange) {
          handleChange({
            target: {
              name: fieldName,
              value: imageUrl
            }
          } as React.ChangeEvent<HTMLInputElement>);
        }
      } catch (err) {
        console.error('Error uploading image:', err);
      } finally {
        setUploading(false);
      }
    }
  };

  const onDesarrolloSelect = (id: string) => {
    setSelectedDesarrolloId(id);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <ResourceDialogContent
          isOpen={open}
          onClose={handleClose}
          resourceType={resourceType}
          resourceId={resourceId}
          isLoading={isLoading}
          isSubmitting={isSubmitting}
          resource={formValues || {}}
          fields={fields}
          selectedAmenities={selectedAmenities}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleSwitchChange={handleSwitchChange}
          handleLeadSelect={handleLeadSelect}
          handleAmenitiesChange={handleAmenitiesChangeWrapper}
          saveResource={handleFormSubmit}
          desarrolloId={desarrolloId}
          prototipo_id={prototipo_id}
          lead_id={lead_id}
          handleImageUpload={adaptedImageUpload}
          uploading={uploading}
          isExistingClient={isExistingClient}
          onExistingClientChange={handleExistingClientChange}
          newClientData={newClientData}
          onNewClientDataChange={handleNewClientDataChange}
          onDesarrolloSelect={onDesarrolloSelect}
          handleDateChange={handleDateChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDialog;
