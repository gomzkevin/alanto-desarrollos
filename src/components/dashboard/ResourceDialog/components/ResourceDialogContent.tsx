
import React from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { Loader2 } from 'lucide-react';
import { FormValues, ResourceType, FieldDefinition } from '../types';
import GenericForm from '../GenericForm';

interface ResourceDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  isLoading: boolean;
  isSubmitting: boolean;
  resource: FormValues | null;
  fields: FieldDefinition[];
  selectedAmenities: string[];
  handleChange: (values: FormValues) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleLeadSelect: (leadId: string, leadName: string) => void;
  handleAmenitiesChange: (amenities: string[]) => void;
  saveResource: () => Promise<boolean>;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploading: boolean;
  isExistingClient: boolean;
  onExistingClientChange: (isExisting: boolean) => void;
  newClientData: { nombre: string; email: string; telefono: string };
  onNewClientDataChange: (field: string, value: string) => void;
  onDesarrolloSelect: (desarrolloId: string) => void;
  handleDateChange: (name: string, date: Date | undefined) => void;
}

export const ResourceDialogContent: React.FC<ResourceDialogContentProps> = ({
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
  onDesarrolloSelect,
  handleDateChange
}) => {
  const getResourceTitle = () => {
    if (resourceId) {
      switch (resourceType) {
        case 'desarrollos': return 'Editar desarrollo';
        case 'prototipos': return 'Editar prototipo';
        case 'leads': return 'Editar lead';
        case 'cotizaciones': return 'Editar cotización';
        case 'unidades': return 'Editar unidad';
        default: return 'Editar recurso';
      }
    } else {
      switch (resourceType) {
        case 'desarrollos': return 'Nuevo desarrollo';
        case 'prototipos': return 'Nuevo prototipo';
        case 'leads': return 'Nuevo lead';
        case 'cotizaciones': return 'Nueva cotización';
        case 'unidades': return 'Nueva unidad';
        default: return 'Nuevo recurso';
      }
    }
  };

  const getResourceDescription = () => {
    if (resourceId) {
      switch (resourceType) {
        case 'desarrollos': return 'Actualizar información del desarrollo';
        case 'prototipos': return 'Actualizar información del prototipo';
        case 'leads': return 'Actualizar información del lead';
        case 'cotizaciones': return 'Actualizar información de la cotización';
        case 'unidades': return 'Actualizar información de la unidad';
        default: return 'Actualizar información del recurso';
      }
    } else {
      switch (resourceType) {
        case 'desarrollos': return 'Crear un nuevo desarrollo';
        case 'prototipos': return 'Crear un nuevo prototipo';
        case 'leads': return 'Registrar un nuevo lead';
        case 'cotizaciones': return 'Crear una nueva cotización';
        case 'unidades': return 'Registrar una nueva unidad';
        default: return 'Crear un nuevo recurso';
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, calling saveResource');
    await saveResource();
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border border-gray-200 shadow-md">
      <form onSubmit={handleFormSubmit} className="flex flex-col h-full">
        <DialogHeader 
          title={getResourceTitle()} 
          description={getResourceDescription()} 
        />
        
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <GenericForm
                resourceType={resourceType}
                fields={fields}
                values={resource}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                onSwitchChange={handleSwitchChange}
                onLeadSelect={handleLeadSelect}
                selectedAmenities={selectedAmenities}
                onAmenitiesChange={handleAmenitiesChange}
                isSubmitting={isSubmitting}
                desarrolloId={desarrolloId}
                prototipo_id={prototipo_id}
                lead_id={lead_id}
                onImageUpload={handleImageUpload}
                uploading={uploading}
                isExistingClient={isExistingClient}
                onExistingClientChange={onExistingClientChange}
                newClientData={newClientData}
                onNewClientDataChange={onNewClientDataChange}
                onDesarrolloSelect={onDesarrolloSelect}
                onDateChange={handleDateChange}
                formId="resource-form"
              />
            </div>
          )}
        </div>
        
        <DialogFooter 
          onClose={onClose}
          onSave={async () => {
            console.log('DialogFooter save button clicked');
            await saveResource();
          }}
          isSubmitting={isSubmitting}
        />
      </form>
    </DialogContent>
  );
};
