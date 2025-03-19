import React from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FormValues, ResourceType, FieldDefinition } from '../types';
import { GenericForm } from '../GenericForm';

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, calling saveResource');
    await saveResource();
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleFormSubmit}>
        <DialogHeader title={getResourceTitle()} />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Cargando...</span>
          </div>
        ) : (
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
          />
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || !resource}>
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
      </form>
    </DialogContent>
  );
};
