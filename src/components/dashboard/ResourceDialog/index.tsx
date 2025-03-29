
import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { ResourceType, FormValues } from './types';
import { ResourceDialogContent } from './components/ResourceDialogContent';
import useResourceData from './useResourceData';
import useResourceActions from './useResourceActions';
import { useResourceFields } from './hooks/useResourceFields';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from '@/components/ui/use-toast';

interface ResourceDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonVariant?: string;
  defaultValues?: Record<string, any>; // Added defaultValues prop
}

const ResourceDialog: React.FC<ResourceDialogProps> = ({
  open = false,
  onClose = () => {},
  resourceType,
  resourceId,
  onSuccess,
  desarrolloId,
  lead_id,
  prototipo_id,
  defaultValues
}) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isExistingClient, setIsExistingClient] = useState(true);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(null);
  const [newClientData, setNewClientData] = useState({ nombre: '', email: '', telefono: '' });
  const [selectedStatus, setSelectedStatus] = useState<string | null>('nuevo');
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { validateRequiredFields } = usePermissions();

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
    onAmenitiesChange: setSelectedAmenities,
    defaultValues
  });

  const fields = useResourceFields(resourceType, selectedStatus);

  const { saveResource, handleImageUpload: uploadResourceImage } = useResourceActions({
    resourceType,
    resourceId,
    onSuccess,
    selectedAmenities,
    clientConfig: {
      isExistingClient,
      newClientData
    }
  });

  useEffect(() => {
    if (open) {
      if (desarrolloId) {
        setSelectedDesarrolloId(desarrolloId);
      }
      
      if (resourceType === 'leads' && !resourceId) {
        setSelectedStatus('nuevo');
      }
    }
  }, [open, desarrolloId, resourceId, resourceType]);

  const handleChange = (values: FormValues) => {
    if (resource) {
      const updatedResource = { ...resource };
      
      Object.keys(values).forEach(key => {
        updatedResource[key] = values[key];
      });
      
      setResource(updatedResource);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log("Select changed:", name, value);
    
    if (name === 'estado' && resourceType === 'leads') {
      setSelectedStatus(value);
      
      if (resource) {
        const updatedResource = {
          ...resource,
          estado: value,
          subestado: ''
        };
        setResource(updatedResource);
      }
    } else if (name === 'desarrollo_id' && resourceType === 'cotizaciones') {
      setSelectedDesarrolloId(value);
      
      if (resource) {
        const updatedResource = {
          ...resource,
          [name]: value
        };
        setResource(updatedResource);
      }
    } else if (resource) {
      const updatedResource = {
        ...resource,
        [name]: value
      };
      setResource(updatedResource);
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (name === 'usar_finiquito') {
      setUsarFiniquito(checked);
    }
    
    if (resource) {
      const updatedResource = {
        ...resource,
        [name]: checked
      };
      setResource(updatedResource);
    }
  };

  const handleLeadSelect = (leadId: string, leadName: string) => {
    if (resource) {
      const updatedResource = {
        ...resource, 
        lead_id: leadId
      };
      setResource(updatedResource);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    
    try {
      const imageUrl = await uploadResourceImage(file);
      
      if (imageUrl && resource) {
        const updatedResource = {
          ...resource,
          imagen_url: imageUrl
        };
        setResource(updatedResource);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveResource = async () => {
    console.log("handleSaveResource called with resource:", resource);
    if (!resource) return false;
    
    // Verificar campos obligatorios antes de guardar
    if (!validateRequiredFields(resource, resourceType)) {
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await saveResource(resource);
      if (success && onSuccess) {
        onSuccess();
      }
      return success;
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar el recurso. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
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
      const updatedResource = {
        ...resource,
        [name]: date.toISOString()
      };
      setResource(updatedResource);
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
