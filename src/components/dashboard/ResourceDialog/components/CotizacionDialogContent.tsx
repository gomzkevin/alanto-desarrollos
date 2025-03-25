
import React from 'react';
import { DialogContent } from '@/components/ui/dialog';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { Loader2 } from 'lucide-react';
import { FormValues, FieldDefinition } from '../types';
import GenericForm from '../GenericForm';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CotizacionDialogContentProps {
  isOpen: boolean;
  onClose: () => void;
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

export const CotizacionDialogContent: React.FC<CotizacionDialogContentProps> = ({
  isOpen,
  onClose,
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
      return 'Editar cotización';
    } else {
      return 'Nueva cotización';
    }
  };

  const getResourceDescription = () => {
    if (resourceId) {
      return 'Actualizar información de la cotización';
    } else {
      return 'Ingresa los datos para la nueva cotización';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, calling saveResource');
    await saveResource();
  };

  // Asegurarnos que los campos monetarios tengan correctamente aplicado el formato currency
  const enhancedFields = fields.map(field => {
    if (field.name === 'monto_anticipo' || field.name === 'monto_finiquito') {
      return {
        ...field,
        formatCurrency: true
      };
    }
    return field;
  });

  return (
    <DialogContent className="p-0 border-2 border-gray-300 shadow-lg rounded-lg max-h-[90vh] overflow-hidden flex flex-col max-w-4xl">
      <form onSubmit={handleFormSubmit} className="flex flex-col h-full max-h-[90vh]">
        <div className="px-10 py-8">
          <DialogHeader 
            title={getResourceTitle()} 
            description={getResourceDescription()}
          />
        </div>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : (
            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="px-10 py-6">
                <div className="space-y-10">
                  <div className="gap-y-8">
                    <div className="bg-gray-50 rounded-xl p-8 shadow-sm border border-gray-100 mx-2">
                      <GenericForm
                        resourceType="cotizaciones"
                        fields={enhancedFields}
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
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
        
        <div className="px-10 py-8">
          <DialogFooter 
            onClose={onClose}
            onSave={async () => {
              console.log('DialogFooter save button clicked');
              await saveResource();
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      </form>
    </DialogContent>
  );
};
