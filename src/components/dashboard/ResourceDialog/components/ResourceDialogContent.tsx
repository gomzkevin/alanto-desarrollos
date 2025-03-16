
import { DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { FormValues, ResourceType } from '../types';
import { FieldDefinition } from '../types';
import GenericForm from '../GenericForm';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { AmenitiesSelector } from '@/components/dashboard/AmenitiesSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

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
  const [activeTab, setActiveTab] = useState('principal');
  
  // Group fields by tab
  const fieldsByTab = fields.reduce((acc, field) => {
    const tab = field.tab || 'principal';
    if (!acc[tab]) {
      acc[tab] = [];
    }
    acc[tab].push(field);
    return acc;
  }, {} as Record<string, FieldDefinition[]>);
  
  // Get unique tab names
  const tabNames = Object.keys(fieldsByTab);

  // Format dates for display
  const formatDate = (date: string | undefined) => {
    if (!date) return undefined;
    try {
      return new Date(date);
    } catch (error) {
      console.error('Error parsing date:', error);
      return undefined;
    }
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

  const renderDateField = (field: FieldDefinition) => {
    if (!resource) return null;
    
    const currentDate = resource[field.name] ? formatDate(resource[field.name] as string) : undefined;
    
    return (
      <div key={field.name} className="mb-4">
        <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !currentDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {currentDate ? format(currentDate, "PP") : <span>Seleccionar fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => handleDateChange?.(field.name, date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader
        title={`${resourceId ? 'Editar' : 'Nuevo'} ${getResourceTypeName()}`}
        description={`${resourceId ? 'Editar la información del' : 'Crear un nuevo'} ${getResourceTypeName().toLowerCase()}`}
      />
      
      {isLoading ? (
        <div className="py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : resourceType === 'desarrollos' ? (
        <Tabs defaultValue="principal" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            {tabNames.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabNames.map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
              {tab === 'amenidades' && handleAmenitiesChange ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Amenidades</h3>
                  <AmenitiesSelector 
                    selectedAmenities={selectedAmenities || []} 
                    onChange={handleAmenitiesChange} 
                  />
                </div>
              ) : tab === 'fechas' ? (
                <div className="space-y-4">
                  {fieldsByTab[tab].map(field => renderDateField(field))}
                </div>
              ) : (
                <GenericForm
                  fields={fieldsByTab[tab]}
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
            </TabsContent>
          ))}
        </Tabs>
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

      <DialogFooter
        onClose={onClose}
        onSave={saveResource}
        isSubmitting={isSubmitting}
      />
    </DialogContent>
  );
}
