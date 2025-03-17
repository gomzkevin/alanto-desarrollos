
import { useEffect } from 'react';
import { ResourceType, FormValues } from '../types';

export const useResourceInitialization = (
  resource: FormValues | null,
  setResource: React.Dispatch<React.SetStateAction<FormValues | null>>,
  defaultValues?: FormValues,
  desarrolloId?: string,
  prototipo_id?: string,
  lead_id?: string,
  resourceType?: ResourceType
) => {
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
};
