
import React from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { Loader2 } from 'lucide-react';
import { FormValues, ResourceType, FieldDefinition } from '../types';
import GenericForm from '../GenericForm';
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

  // Determine dialog class based on resource type
  const getDialogClass = () => {
    // Only cotizaciones need the wider dialog
    return resourceType === 'cotizaciones' 
      ? "max-w-4xl" 
      : "max-w-lg";
  };

  return (
    <DialogContent className={`p-0 border-2 border-gray-300 shadow-lg rounded-lg max-h-[90vh] overflow-hidden flex flex-col ${getDialogClass()}`}>
      <form onSubmit={handleFormSubmit} className="flex flex-col h-full max-h-[90vh]">
        <DialogHeader 
          title={getResourceTitle()} 
          description={getResourceDescription()} 
        />
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : (
            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="px-6 py-4">
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
              </div>
            </ScrollArea>
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
