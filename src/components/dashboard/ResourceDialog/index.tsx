
import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ResourceType, FormValues } from './types';
import { ResourceDialogContent } from './components/ResourceDialogContent';
import useResourceData from './useResourceData';
import useResourceActions from './useResourceActions';
import { useResourceFields } from './hooks/useResourceFields';

interface ResourceDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
}

const ResourceDialog: React.FC<ResourceDialogProps> = ({
  open = false,
  onClose = () => {},
  resourceType,
  resourceId,
  onSuccess,
  desarrolloId,
  lead_id,
  prototipo_id
}) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isExistingClient, setIsExistingClient] = useState(true);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(null);
  const [newClientData, setNewClientData] = useState({ nombre: '', email: '', telefono: '' });
  const [selectedStatus, setSelectedStatus] = useState<string | null>('nuevo');
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Custom hook to fetch resource data
  const { 
    resource, 
    setResource, 
    fields: resourceDataFields,
    isLoading 
  } = useResourceData({
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
  });

  // Get field definitions using the hook
  const fields = useResourceFields(resourceType, selectedStatus);

  // Custom hook for resource actions (save, delete)
  const { saveResource, uploadImage } = useResourceActions({
    resourceType,
    resourceId,
    onSuccess,
    isExistingClient,
    newClientData
  });

  useEffect(() => {
    if (open) {
      if (desarrolloId) {
        setSelectedDesarrolloId(desarrolloId);
      }
      
      // Set default status for new leads
      if (resourceType === 'leads' && !resourceId) {
        setSelectedStatus('nuevo');
      }
    }
  }, [open, desarrolloId, resourceId, resourceType]);

  // Handle form change
  const handleChange = (values: FormValues) => {
    if (resource) {
      setResource({ ...resource, ...values });
    }
  };

  // Handle select field change
  const handleSelectChange = (name: string, value: string) => {
    console.log("Select changed:", name, value);
    
    if (name === 'estado' && resourceType === 'leads') {
      setSelectedStatus(value);
    } else if (name === 'desarrollo_id' && resourceType === 'cotizaciones') {
      setSelectedDesarrolloId(value);
    }
  };

  // Handle switch field change
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === 'usar_finiquito') {
      setUsarFiniquito(checked);
    }
  };

  // Handle client selection
  const handleLeadSelect = (leadId: string, leadName: string) => {
    if (resource) {
      setResource({ ...resource, lead_id: leadId });
    }
  };

  // Handler for image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      const imageUrl = await uploadImage(file);
      
      if (imageUrl && resource) {
        setResource({ ...resource, imagen_url: imageUrl });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSaveResource = async () => {
    if (!resource) return false;
    
    setIsSubmitting(true);
    
    try {
      await saveResource(resource);
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (error) {
      console.error('Error saving resource:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewClientDataChange = (field: string, value: string) => {
    setNewClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleExistingClientChange = (isExisting: boolean) => {
    setIsExistingClient(isExisting);
  };

  const handleDesarrolloSelect = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (resource && date) {
      setResource({ ...resource, [name]: date.toISOString() });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <ResourceDialogContent
        isOpen={open}
        onClose={onClose}
        resourceType={resourceType}
        resourceId={resourceId}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        resource={resource}
        fields={fields}
        selectedAmenities={selectedAmenities}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSwitchChange={handleSwitchChange}
        handleLeadSelect={handleLeadSelect}
        handleAmenitiesChange={setSelectedAmenities}
        saveResource={handleSaveResource}
        desarrolloId={desarrolloId}
        prototipo_id={prototipo_id}
        lead_id={lead_id}
        handleImageUpload={handleImageUpload}
        uploading={uploading}
        isExistingClient={isExistingClient}
        onExistingClientChange={handleExistingClientChange}
        newClientData={newClientData}
        onNewClientDataChange={handleNewClientDataChange}
        onDesarrolloSelect={handleDesarrolloSelect}
        handleDateChange={handleDateChange}
      />
    </Dialog>
  );
};

export default ResourceDialog;
