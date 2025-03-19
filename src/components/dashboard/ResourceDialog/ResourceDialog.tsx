
import React from 'react';
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
  const { fields, selectedStatus } = useResourceFields(resourceType);
  
  const {
    resource,
    isLoading,
    selectedAmenities,
    setSelectedAmenities,
    isExistingClient,
    setIsExistingClient,
    newClientData,
    setNewClientData,
    onDesarrolloSelect
  } = useResourceData(resourceType, resourceId, desarrolloId);

  const {
    isLoading: isSubmitting,
    resourceData,
    saveResource: handleSaveResource,
    handleImageUpload
  } = useResourceActions({
    resourceType,
    resourceId,
    onSuccess,
    selectedAmenities,
    clientConfig: {
      isExistingClient,
      newClientData
    }
  });

  const {
    formValues,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleLeadSelect,
    handleDateChange,
    uploading,
    setUploading
  } = useResourceForm(resource);
  
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };
  
  const saveResource = async () => {
    return await handleSaveResource(formValues);
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

  const handleAmenitiesChange = (amenities: string[]) => {
    setSelectedAmenities(amenities);
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
          resource={formValues}
          fields={fields}
          selectedAmenities={selectedAmenities}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleSwitchChange={handleSwitchChange}
          handleLeadSelect={handleLeadSelect}
          handleAmenitiesChange={handleAmenitiesChange}
          saveResource={saveResource}
          desarrolloId={desarrolloId}
          prototipo_id={prototipo_id}
          lead_id={lead_id}
          handleImageUpload={handleImageUpload}
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
