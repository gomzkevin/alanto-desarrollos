
import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { FormValues } from './types';
import { CotizacionDialogContent } from './components/CotizacionDialogContent';
import useResourceData from './useResourceData';
import useResourceActions from './useResourceActions';
import { useResourceFields } from './hooks/useResourceFields';

interface CotizacionDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceId?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
  defaultValues?: Record<string, any>;
}

const CotizacionDialog: React.FC<CotizacionDialogProps> = ({
  open = false,
  onClose = () => {},
  resourceId,
  onSuccess,
  desarrolloId,
  lead_id,
  defaultValues = {}
}) => {
  console.log('CotizacionDialog: Initial defaultValues:', defaultValues);
  
  // Explicitly ensure isExistingClient exists in defaultValues
  const initialIsExistingClient = defaultValues.isExistingClient !== undefined 
    ? defaultValues.isExistingClient 
    : resourceId ? true : false; // Default to true if editing, false if new
  
  console.log('CotizacionDialog: initialIsExistingClient:', initialIsExistingClient);
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isExistingClient, setIsExistingClient] = useState(initialIsExistingClient);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(null);
  const [newClientData, setNewClientData] = useState({ nombre: '', email: '', telefono: '' });
  const [selectedStatus, setSelectedStatus] = useState<string | null>('nuevo');
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mergedDefaultValues = {
    monto_anticipo: 0,
    monto_finiquito: 0,
    ...defaultValues
  };

  console.log('CotizacionDialog: Using mergedDefaultValues:', mergedDefaultValues);

  const resourceType = 'cotizaciones';

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
    defaultValues: mergedDefaultValues
  });

  const rawFields = useResourceFields(resourceType, selectedStatus);
  const fields = rawFields.map(field => {
    if (field.name === 'monto_anticipo' || field.name === 'monto_finiquito') {
      return { 
        ...field, 
        formatCurrency: true 
      };
    }
    return field;
  });

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
      
      // Make sure isExistingClient is correctly set when dialog opens
      console.log("Setting isExistingClient to:", initialIsExistingClient);
      setIsExistingClient(initialIsExistingClient);
      
      if (!resourceId) {
        setNewClientData({ nombre: '', email: '', telefono: '' });
      }
    }
  }, [open, desarrolloId, resourceId, initialIsExistingClient]);

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
    
    if (name === 'desarrollo_id') {
      setSelectedDesarrolloId(value);
    }
    
    if (resource) {
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
    
    setIsSubmitting(true);
    
    try {
      if (!isExistingClient && !resourceId) {
        console.log("Creating new cotización with new client:", {
          isExistingClient,
          newClientData
        });
      }
      
      const success = await saveResource(resource);
      if (success && onSuccess) {
        onSuccess();
      }
      return success;
    } catch (error) {
      console.error('Error saving resource:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewClientDataChange = (field: string, value: string) => {
    console.log(`Updating new client ${field} to:`, value);
    setNewClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleExistingClientChange = (isExisting: boolean) => {
    console.log("Setting isExistingClient to:", isExisting);
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
      <CotizacionDialogContent
        isOpen={open}
        onClose={onClose}
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

export default CotizacionDialog;
