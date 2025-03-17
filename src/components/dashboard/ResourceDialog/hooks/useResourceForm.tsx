
import { useState } from 'react';
import useResourceData from '../useResourceData';
import { UseResourceFormProps, UseResourceFormReturn } from './useResourceFormTypes';
import { useFormHandlers } from './useFormHandlers';
import { useResourceInitialization } from './useResourceInitialization';
import { useSaveResource } from './useSaveResource';

export const useResourceForm = ({
  resourceType,
  resourceId,
  defaultValues,
  desarrolloId,
  prototipo_id,
  lead_id,
  onSuccess,
  onSave,
}: UseResourceFormProps): UseResourceFormReturn => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(desarrolloId || null);

  const { resource, setResource, fields, isLoading } = useResourceData({
    resourceType,
    resourceId,
    desarrolloId,
    lead_id,
    prototipo_id,
    selectedDesarrolloId,
    selectedStatus,
    usarFiniquito,
    selectedAmenities,
    onStatusChange: setSelectedStatus,
    onAmenitiesChange: setSelectedAmenities,
  });

  // Inicializar el recurso con valores por defecto y IDs
  useResourceInitialization(
    resource, 
    setResource, 
    defaultValues, 
    desarrolloId, 
    prototipo_id, 
    lead_id, 
    resourceType
  );

  // Obtener los manejadores de eventos del formulario
  const {
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleAmenitiesChange,
    handleLeadSelect,
    handleDateChange
  } = useFormHandlers(
    resource,
    setResource,
    setSelectedStatus,
    setUsarFiniquito,
    setSelectedAmenities
  );

  // Obtener la función para guardar el recurso
  const { isSubmitting, saveResource } = useSaveResource(
    resource,
    resourceType,
    resourceId,
    selectedAmenities,
    desarrolloId,
    onSuccess,
    onSave
  );

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
