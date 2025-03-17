
import { DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { FormValues, ResourceType } from '../types';
import { FieldDefinition } from '../types';
import GenericForm from '../GenericForm';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { useMemo } from 'react';

interface ResourceDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  isLoading: boolean;
  isSubmitting: boolean;
  resource: FormValues | null;
  fields: FieldDefinition[];
  selectedAmenities?: string[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleLeadSelect?: (leadId: string, leadName: string) => void;
  handleAmenitiesChange?: (amenities: string[]) => void;
  saveResource: () => void;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading?: boolean;
  isExistingClient?: boolean;
  onExistingClientChange?: (isExisting: boolean) => void;
  newClientData?: {
    nombre: string;
    email: string;
    telefono: string;
  };
  onNewClientDataChange?: (field: string, value: string) => void;
  onDesarrolloSelect?: (desarrolloId: string) => void;
  handleDateChange?: (name: string, date: Date | undefined) => void;
}

export function ResourceDialogContent({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  isLoading,
  isSubmitting,
  resource,
  fields,
  selectedAmenities = [],
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  handleLeadSelect,
  handleAmenitiesChange,
  saveResource,
  desarrolloId,
  prototipo_id,
  lead_id,
  handleImageUpload,
  uploading,
  isExistingClient,
  onExistingClientChange,
  newClientData,
  onNewClientDataChange,
  onDesarrolloSelect,
  handleDateChange
}: ResourceDialogContentProps) {
  
  // Helper function to convert resource object to values object for GenericForm
  const getFormValues = () => {
    if (!resource) return {} as FormValues;
    return resource;
  };

  const getResourceTypeName = () => {
    switch (resourceType) {
      case 'desarrollos':
        return 'Desarrollo';
      case 'prototipos':
        return 'Prototipo';
      case 'leads':
        return 'Lead';
      case 'cotizaciones':
        return 'Cotización';
      case 'unidades':
        return 'Unidad';
      default:
        return 'Recurso';
    }
  };

  // Create an adapter function for onChange to match expected signature in GenericForm
  const handleFormChange = (name: string, value: any) => {
    // Create a synthetic event object
    const syntheticEvent = {
      target: {
        name,
        value
      }
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };

  // Use useMemo to ensure form values don't cause re-renders unnecessarily
  const formValues = useMemo(() => getFormValues(), [resource]);

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gray-50 p-0">
      <DialogHeader
        title={`${resourceId ? 'Editar' : 'Nuevo'} ${getResourceTypeName()}`}
        description={`${resourceId ? 'Editar la información del' : 'Crear un nuevo'} ${getResourceTypeName().toLowerCase()}`}
      />
      
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="py-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <GenericForm
            fields={fields}
            values={formValues}
            onChange={(values: FormValues) => {
              Object.entries(values).forEach(([name, value]) => {
                handleFormChange(name, value);
              });
            }}
            onSelectChange={handleSelectChange}
            onSwitchChange={handleSwitchChange}
            onLeadSelect={handleLeadSelect}
            onDateChange={handleDateChange || (() => {})}
            onAmenitiesChange={handleAmenitiesChange}
            selectedAmenities={selectedAmenities}
            isSubmitting={isSubmitting}
            onSubmit={saveResource}
            formId="resource-form"
          />
        )}
      </div>

      <DialogFooter
        onClose={onClose}
        onSave={saveResource}
        isSubmitting={isSubmitting}
      />
    </DialogContent>
  );
}
