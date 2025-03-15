
import { DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormValues, ResourceType } from '../types';
import { FieldDefinition } from '../types';
import GenericForm from '../GenericForm';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { Loader2 } from 'lucide-react';

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
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader
        title={`${resourceId ? 'Editar' : 'Nuevo'} ${getResourceTypeName()}`}
        description={`${resourceId ? 'Editar la información del' : 'Crear un nuevo'} ${getResourceTypeName().toLowerCase()}`}
      />
      
      {isLoading ? (
        <div className="py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
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
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={saveResource} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
