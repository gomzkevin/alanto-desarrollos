
import React, { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GenericForm from '../GenericForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResourceType, FieldDefinition, FormValues } from '../types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ClientSearch } from './ClientSearch';

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
  const [localResourceId, setLocalResourceId] = useState<string | undefined>(resourceId);
  const formId = `${resourceType}-form-${localResourceId || 'new'}`;
  
  const processedFields = fields.map(field => {
    if (resourceType === 'desarrollos' && 
        (field.name === 'unidades_disponibles' || 
         field.name === 'avance_porcentaje')) {
      return { ...field, readOnly: true };
    }
    
    if (resourceType === 'prototipos' && 
        (field.name === 'unidades_vendidas' || 
         field.name === 'unidades_con_anticipo')) {
      return { ...field, readOnly: true };
    }
    
    if (resourceId && resourceType === 'unidades' && field.name === 'numero') {
      return { ...field, readOnly: true };
    }
    
    return field;
  });
  
  useEffect(() => {
    setLocalResourceId(resourceId);
  }, [resourceId]);
  
  const handleFormSubmit = async () => {
    try {
      const success = await saveResource();
      if (success) {
        onClose();
      }
      return success;
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      return false;
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          {resourceId
            ? `Editar ${resourceType === 'desarrollos' ? 'desarrollo' : 
                resourceType === 'prototipos' ? 'prototipo' : 
                resourceType === 'leads' ? 'lead' : 
                resourceType === 'cotizaciones' ? 'cotización' :
                resourceType === 'unidades' ? 'unidad' : 'recurso'}`
            : `Nuevo ${resourceType === 'desarrollos' ? 'desarrollo' : 
                resourceType === 'prototipos' ? 'prototipo' : 
                resourceType === 'leads' ? 'lead' : 
                resourceType === 'cotizaciones' ? 'cotización' :
                resourceType === 'unidades' ? 'unidad' : 'recurso'}`}
        </DialogTitle>
        <DialogDescription>
          {resourceType === 'desarrollos' && 'Información del desarrollo inmobiliario'}
          {resourceType === 'prototipos' && 'Información del tipo de propiedad'}
          {resourceType === 'leads' && 'Información del prospecto'}
          {resourceType === 'cotizaciones' && 'Información de la cotización'}
          {resourceType === 'unidades' && 'Información de la unidad'}
        </DialogDescription>
      </DialogHeader>
      
      {isLoading ? (
        <div className="py-6">
          <p className="text-center text-gray-500">Cargando...</p>
        </div>
      ) : resource ? (
        <>
          {resourceType === 'cotizaciones' && !resourceId && (
            <div className="space-y-4 py-2">
              <fieldset className="space-y-4">
                <legend className="text-sm font-medium">Seleccionar cliente</legend>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="existing-client"
                    checked={isExistingClient}
                    onCheckedChange={(checked) => onExistingClientChange(checked as boolean)}
                  />
                  <label
                    htmlFor="existing-client"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cliente existente
                  </label>
                </div>
                
                {isExistingClient ? (
                  <ClientSearch
                    value={lead_id || (resource?.lead_id as string) || ''}
                    onClientSelect={handleLeadSelect}
                    isExistingClient={isExistingClient}
                    onExistingClientChange={onExistingClientChange}
                    newClientData={newClientData}
                    onNewClientDataChange={onNewClientDataChange}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="client-name">Nombre del cliente</Label>
                      <Input
                        id="client-name"
                        value={newClientData.nombre}
                        onChange={(e) => onNewClientDataChange('nombre', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="client-email">Email</Label>
                      <Input
                        id="client-email"
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => onNewClientDataChange('email', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="client-phone">Teléfono</Label>
                      <Input
                        id="client-phone"
                        value={newClientData.telefono}
                        onChange={(e) => onNewClientDataChange('telefono', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </fieldset>
              
              <Separator />
            </div>
          )}
          
          <GenericForm
            formId={formId}
            fields={processedFields}
            values={resource}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            onSwitchChange={handleSwitchChange}
            onLeadSelect={handleLeadSelect}
            onDateChange={handleDateChange}
            onAmenitiesChange={handleAmenitiesChange}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            selectedAmenities={selectedAmenities}
          />
          
          {resourceType === 'unidades' && (
            <Alert className="mt-4">
              <InfoCircledIcon className="h-4 w-4" />
              <AlertDescription>
                {resourceId 
                  ? "El identificador de la unidad no se puede modificar."
                  : "Recuerda que puedes asignar un comprador a una unidad seleccionando un cliente existente."
                }
              </AlertDescription>
            </Alert>
          )}
          
          {resourceType === 'desarrollos' && (
            <Alert className="mt-4">
              <InfoCircledIcon className="h-4 w-4" />
              <AlertDescription>
                Los campos "Unidades Disponibles" y "Avance Comercial (%)" son calculados automáticamente y no pueden ser editados manualmente.
              </AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <div className="py-6">
          <p className="text-center text-gray-500">No se pudo cargar la información</p>
        </div>
      )}
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          form={formId}
          disabled={isSubmitting || isLoading || !resource}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
