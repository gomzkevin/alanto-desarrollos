
import { ResourceType, FormValues } from '../../types';

export interface ClientConfig {
  isExistingClient: boolean;
  newClientData: {
    nombre: string;
    email: string;
    telefono: string;
  };
}

export interface UseResourceActionsProps {
  resourceType: ResourceType;
  resourceId?: string;
  onSuccess?: () => void;
  selectedAmenities?: string[];
  clientConfig?: ClientConfig;
}

export interface ResourceOperationResult {
  success: boolean;
  data?: any;
  error?: any;
  message?: string;
}

// Add ResourceData type
export type ResourceData = Record<string, any>;
export type ResourceFormValues = FormValues;
