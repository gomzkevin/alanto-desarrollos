
import { DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { FormValues, ResourceType } from '../types';
import { FieldDefinition } from '../types';
import GenericForm from '../GenericForm';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  selectedAmenities,
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
  onDesarrolloSelect
}: ResourceDialogContentProps) {

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

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
      <DialogHeader
        title={`${resourceId ? 'Editar' : 'Nuevo'} ${getResourceTypeName()}`}
        description={`${resourceId ? 'Editar la información del' : 'Crear un nuevo'} ${getResourceTypeName().toLowerCase()}`}
      />
      
      {isLoading ? (
        <div className="py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-auto px-1">
          <div className="pr-4">
            <GenericForm
              fields={fields}
              resource={resource}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleSwitchChange={handleSwitchChange}
              resourceType={resourceType}
              handleAmenitiesChange={handleAmenitiesChange}
              selectedAmenities={selectedAmenities}
              resourceId={resourceId}
              desarrolloId={desarrolloId}
              prototipo_id={prototipo_id}
              lead_id={lead_id}
              handleLeadSelect={handleLeadSelect}
              handleImageUpload={handleImageUpload}
              uploading={uploading}
              isExistingClient={isExistingClient}
              onExistingClientChange={onExistingClientChange}
              newClientData={newClientData}
              onNewClientDataChange={onNewClientDataChange}
              onDesarrolloSelect={onDesarrolloSelect}
            />
          </div>
        </ScrollArea>
      )}

      <DialogFooter
        onClose={onClose}
        onSave={saveResource}
        isSubmitting={isSubmitting}
      />
    </DialogContent>
  );
}
