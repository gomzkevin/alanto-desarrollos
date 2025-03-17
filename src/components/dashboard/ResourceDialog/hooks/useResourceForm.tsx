
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useResourceData } from '../useResourceData';
import { useResourceActions } from '../useResourceActions';
import { ResourceType, FormValues } from '../types';

interface UseResourceFormProps {
  resourceType: ResourceType;
  resourceId?: string;
  defaultValues?: FormValues;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  onSuccess?: () => void;
  onSave?: (resource: FormValues) => void;
}

export const useResourceForm = ({
  resourceType,
  resourceId,
  defaultValues,
  desarrolloId,
  prototipo_id,
  lead_id,
  onSuccess,
  onSave,
}: UseResourceFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(desarrolloId || null);

  const { resource, setResource, fields, isLoading } = useResourceData({
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
  });

  // Initialize with default values if provided
  useEffect(() => {
    if (defaultValues && !resource) {
      setResource(defaultValues);
    }
  }, [defaultValues, resource, setResource]);

  // Initialize resources with IDs from props
  useEffect(() => {
    if (resource) {
      const resourceCopy = { ...resource };
      
      // Update resource with prop values if available
      if (desarrolloId && resourceType === 'prototipos') {
        resourceCopy.desarrollo_id = desarrolloId;
      }
      
      if (prototipo_id && resourceType === 'unidades') {
        resourceCopy.prototipo_id = prototipo_id;
      }
      
      if (lead_id && resourceType === 'cotizaciones') {
        resourceCopy.lead_id = lead_id;
      }
      
      // Only update if there are changes
      if (JSON.stringify(resourceCopy) !== JSON.stringify(resource)) {
        setResource(resourceCopy);
      }
    }
  }, [resource, desarrolloId, prototipo_id, lead_id, resourceType, setResource]);

  // Setup resource actions
  const { createResource, updateResource } = useResourceActions(resourceType);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!resource) return;
    
    const { name, value, type } = e.target;
    let updatedValue: any = value;
    
    if (type === 'number') {
      updatedValue = value === '' ? null : Number(value);
    }
    
    setResource({ ...resource, [name]: updatedValue });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!resource) return;
    
    if (name === 'estado' && resourceType === 'leads') {
      setSelectedStatus(value);
    }
    
    setResource({ ...resource, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!resource) return;
    
    if (name === 'usar_finiquito') {
      setUsarFiniquito(checked);
    }
    
    setResource({ ...resource, [name]: checked });
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    if (!resource) return;
    
    setSelectedAmenities(amenities);
    setResource({ ...resource, amenidades: amenities });
  };

  const handleLeadSelect = (leadId: string, leadName: string) => {
    if (!resource) return;
    
    // Si estamos en unidades, también guardamos el nombre para mostrar
    if (resourceType === 'unidades') {
      setResource({ 
        ...resource, 
        comprador_id: leadId,
        comprador_nombre: leadName
      });
    } else {
      setResource({ ...resource, lead_id: leadId });
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!resource) return;
    
    setResource({ ...resource, [name]: date });
  };

  const saveResource = async (resourceToSave: FormValues = resource as FormValues) => {
    if (!resourceToSave) return false;
    
    setIsSubmitting(true);
    
    try {
      // Si hay amenidades en formato array, conviertelas a JSON
      if (resourceType === 'desarrollos' && selectedAmenities.length > 0) {
        resourceToSave.amenidades = selectedAmenities;
      }
      
      let result;
      
      if (resourceId) {
        result = await updateResource(resourceId, resourceToSave);
      } else {
        result = await createResource(resourceToSave);
      }
      
      toast({
        title: 'Éxito',
        description: `${resourceId ? 'Actualizado' : 'Creado'} correctamente`,
      });
      
      // Call the onSuccess handler if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Call the onSave handler if provided
      if (onSave) {
        onSave(result);
      }
      
      return true;
    } catch (error: any) {
      console.error('Error saving resource:', error);
      
      toast({
        title: 'Error',
        description: `No se pudo ${resourceId ? 'actualizar' : 'crear'} el recurso: ${error.message}`,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    isSubmitting,
    resource,
    setResource,
    fields,
    selectedAmenities,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleLeadSelect,
    handleAmenitiesChange,
    saveResource,
    handleDateChange
  };
};
