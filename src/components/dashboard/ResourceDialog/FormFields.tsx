
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { AmenitiesSelector } from '../AmenitiesSelector';
import { FormValues, FieldDefinition } from './types';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  field: FieldDefinition;
  resource: FormValues | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmenitiesChange: (amenities: string[]) => void;
  selectedDate?: Date;
  uploading: boolean;
  selectedAmenities: string[];
  desarrolloId?: string;
  resourceId?: string;
  resourceType: string;
}

// Define FormFieldsProps separate from FormFieldProps with fields array
interface FormFieldsProps {
  fields: FieldDefinition[];
  resource: FormValues | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  handleDateChange: (date: Date | undefined) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmenitiesChange: (amenities: string[]) => void;
  selectedDate?: Date;
  uploading: boolean;
  selectedAmenities: string[];
  tabName?: string;
  desarrolloId?: string;
  resourceId?: string;
  resourceType: string;
}

export const FormField = ({
  field,
  resource,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  handleDateChange,
  handleImageUpload,
  handleAmenitiesChange,
  selectedDate,
  uploading,
  selectedAmenities,
  desarrolloId,
  resourceId,
  resourceType
}: FormFieldProps) => {
  
  // Skip desarrollo_id field if we already have desarrolloId
  if (resourceType === 'prototipos' && field.name === 'desarrollo_id' && desarrolloId) {
    return null;
  }
  
  // Handle amenities field
  if (field.type === 'amenities') {
    return (
      <div key={field.name} className="space-y-3">
        <Label>{field.label}</Label>
        <AmenitiesSelector 
          selectedAmenities={selectedAmenities} 
          onChange={handleAmenitiesChange} 
        />
      </div>
    );
  }
  
  // Handle image upload field for desarrollos
  if (field.name === 'imagen_url' && resourceType === 'desarrollos') {
    return (
      <div key={field.name} className="space-y-3">
        <Label>{field.label}</Label>
        {resourceId ? (
          <p className="text-sm text-gray-500 mb-2">
            Las imágenes del desarrollo se gestionan directamente desde la vista de detalle del desarrollo.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <Input
                type="file"
                accept="image/*"
                id={`${field.name}-upload`}
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label
                htmlFor={`${field.name}-upload`}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Subir imagen
              </Label>
              {uploading && <span className="text-sm text-gray-500">Subiendo...</span>}
            </div>
            
            {resource && (resource as any)[field.name] && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                <div className="relative w-full max-w-xs">
                  <img 
                    src={(resource as any)[field.name]} 
                    alt="Vista previa" 
                    className="w-full h-48 rounded-md object-cover" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      // This would need a custom handler passed in
                      console.log("Clear image clicked");
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  // Render different field types
  switch (field.type) {
    case 'select':
      return (
        <div key={field.name} className="space-y-3">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Select 
            value={resource ? (resource as any)[field.name] || '' : ''}
            onValueChange={(value) => handleSelectChange(field.name, value)}
          >
            <SelectTrigger id={field.name} className="bg-white">
              <SelectValue placeholder={`Seleccionar ${field.label}`} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
      
    case 'switch':
      return (
        <div key={field.name} className="flex items-center justify-between space-y-0 space-x-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Switch
            id={field.name}
            checked={resource ? Boolean((resource as any)[field.name]) : false}
            onCheckedChange={(checked) => handleSwitchChange(field.name, checked)}
          />
        </div>
      );
      
    case 'date':
      return (
        <div key={field.name} className="space-y-3">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left", !selectedDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      );
      
    case 'textarea':
      return (
        <div key={field.name} className="space-y-3">
          <Label htmlFor={field.name}>{field.label}</Label>
          <textarea
            id={field.name}
            name={field.name}
            value={resource ? (resource as any)[field.name] || '' : ''}
            onChange={handleChange}
            className="w-full min-h-[100px] p-3 border border-input rounded-md"
          />
        </div>
      );
    
    case 'number':
      // Para campos numéricos, usamos formatCurrency para valores monetarios
      const isMonetaryField = ['precio', 'adr_base', 'monto_anticipo', 'monto_finiquito', 'gastos_fijos'].includes(field.name);
      return (
        <div key={field.name} className="space-y-3">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            type="text"
            inputMode="numeric"
            id={field.name}
            name={field.name}
            formatCurrency={isMonetaryField}
            value={resource ? (resource as any)[field.name] ?? '' : ''}
            onChange={handleChange}
            placeholder={field.label}
          />
        </div>
      );
      
    default:
      // Para campos de texto (y otros tipos no específicos)
      return (
        <div key={field.name} className="space-y-3">
          <Label htmlFor={field.name}>{field.label}</Label>
          <Input
            type={field.type}
            id={field.name}
            name={field.name}
            value={resource ? (resource as any)[field.name] || '' : ''}
            onChange={handleChange}
            placeholder={field.label}
          />
        </div>
      );
  }
};

export default function FormFields({ 
  fields, 
  resource, 
  handleChange, 
  handleSelectChange, 
  handleSwitchChange, 
  handleDateChange, 
  handleImageUpload, 
  handleAmenitiesChange, 
  selectedDate, 
  uploading, 
  selectedAmenities, 
  tabName, 
  desarrolloId,
  resourceId,
  resourceType
}: FormFieldsProps) {
  const filteredFields = tabName 
    ? fields.filter(field => field.tab === tabName)
    : fields;
    
  return (
    <div className={tabName ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid gap-4 py-4"}>
      {filteredFields.map(field => (
        <FormField
          key={field.name}
          field={field}
          resource={resource}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          handleSwitchChange={handleSwitchChange}
          handleDateChange={handleDateChange}
          handleImageUpload={handleImageUpload}
          handleAmenitiesChange={handleAmenitiesChange}
          selectedDate={selectedDate}
          uploading={uploading}
          selectedAmenities={selectedAmenities}
          desarrolloId={desarrolloId}
          resourceId={resourceId}
          resourceType={resourceType}
        />
      ))}
    </div>
  );
}
