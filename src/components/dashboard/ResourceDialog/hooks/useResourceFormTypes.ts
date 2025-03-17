
import { ResourceType, FormValues } from '../types';

export interface UseResourceFormProps {
  resourceType: ResourceType;
  resourceId?: string;
  defaultValues?: FormValues;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  onSuccess?: () => void;
  onSave?: (resource: FormValues) => void;
}

export interface UseResourceFormReturn {
  isLoading: boolean;
  isSubmitting: boolean;
  resource: FormValues | null;
  setResource: React.Dispatch<React.SetStateAction<FormValues | null>>;
  fields: any[];
  selectedAmenities: string[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | FormValues) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleLeadSelect: (leadId: string, leadName: string) => void;
  handleAmenitiesChange: (amenities: string[]) => void;
  saveResource: (resourceToSave?: FormValues) => Promise<boolean>;
  handleDateChange: (name: string, date: Date | undefined) => void;
}
