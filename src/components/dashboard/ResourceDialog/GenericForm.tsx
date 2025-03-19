
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { FieldDefinition, FormValues } from './types';
import { ClientSearch } from './components/ClientSearch';
import { AmenitiesSelector } from '@/components/dashboard/AmenitiesSelector';
import ImageUploader from '@/components/dashboard/ImageUploader';
import { InterestSelector } from './components/InterestSelector';
import { cn } from '@/lib/utils';

interface GenericFormProps {
  formId: string;
  fields: FieldDefinition[];
  values: FormValues;
  onChange: (values: FormValues) => void;
  onSelectChange: (name: string, value: string) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onLeadSelect: (leadId: string, leadName: string) => void;
  onDateChange: (name: string, date: Date | undefined) => void;
  onAmenitiesChange?: (amenities: string[]) => void;
  selectedAmenities?: string[];
  isSubmitting?: boolean;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
}

const GenericForm: React.FC<GenericFormProps> = ({
  formId,
  fields,
  values,
  onChange,
  onSelectChange,
  onSwitchChange,
  onLeadSelect,
  onDateChange,
  onAmenitiesChange,
  selectedAmenities = [],
  isSubmitting = false,
  onSubmit
}) => {
  // Group fields by tab
  const groupedFields = fields.reduce<Record<string, FieldDefinition[]>>((groups, field) => {
    const tab = field.tab || 'general';
    if (!groups[tab]) {
      groups[tab] = [];
    }
    groups[tab].push(field);
    return groups;
  }, {});

  const tabs = Object.keys(groupedFields);
  
  // Handle field change
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    // Convert value types based on field
    if (type === 'number') {
      processedValue = value === '' ? null : Number(value);
    }
    
    onChange({ [name]: processedValue });
  };
  
  const handleSelectFieldChange = (name: string, value: string) => {
    onSelectChange(name, value);
  };
  
  const renderField = (field: FieldDefinition) => {
    const { name, label, type, options = [], required, readOnly, placeholder } = field;
    const fieldValue = values[name] !== undefined ? values[name] : '';
    
    switch (type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={name}
              name={name}
              type={type}
              value={fieldValue}
              onChange={handleFieldChange}
              disabled={isSubmitting || readOnly}
              required={required}
              placeholder={placeholder}
              className={readOnly ? 'bg-gray-100' : ''}
              min={type === 'number' ? 0 : undefined}
            />
          </div>
        );
        
      case 'textarea':
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={name}
              name={name}
              value={fieldValue}
              onChange={handleFieldChange}
              disabled={isSubmitting || readOnly}
              required={required}
              placeholder={placeholder}
              className={readOnly ? 'bg-gray-100' : ''}
            />
          </div>
        );
        
      case 'select':
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleSelectFieldChange(name, value)}
              disabled={isSubmitting || readOnly}
            >
              <SelectTrigger id={name} className={readOnly ? 'bg-gray-100' : ''}>
                <SelectValue placeholder={placeholder || `Seleccionar ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
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
          <div className="flex items-center justify-between gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Switch
              id={name}
              checked={!!fieldValue}
              onCheckedChange={(checked) => onSwitchChange(name, checked)}
              disabled={isSubmitting || readOnly}
            />
          </div>
        );
        
      case 'date':
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id={name}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fieldValue && "text-muted-foreground",
                    readOnly && "bg-gray-100"
                  )}
                  disabled={isSubmitting || readOnly}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fieldValue ? format(new Date(fieldValue as string), "PPP") : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fieldValue ? new Date(fieldValue as string) : undefined}
                  onSelect={(date) => onDateChange(name, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'select-lead':
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <ClientSearch
              value={fieldValue}
              onClientSelect={onLeadSelect}
              isExistingClient={true}
              onExistingClientChange={() => {}}
            />
          </div>
        );
      
      case 'amenities':
        if (!onAmenitiesChange) return null;
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <AmenitiesSelector
              selectedAmenities={selectedAmenities}
              onChange={onAmenitiesChange}
            />
          </div>
        );
      
      case 'image-upload':
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <ImageUploader 
              entityId={values.id || name}
              bucketName={field.bucket || 'prototipo-images'} 
              folderPath={field.folder || 'prototipos'} 
              currentImageUrl={fieldValue} 
              onImageUploaded={(url) => onChange({ [name]: url })}
            />
          </div>
        );

      case 'interest-selector':
        return (
          <div className="grid gap-2" key={name}>
            <Label htmlFor={name} className="flex">
              {label} {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <InterestSelector
              value={fieldValue}
              onChange={(value) => onChange({ [name]: value })}
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="py-4">
      {tabs.length <= 1 ? (
        <div className="space-y-4">
          {fields.map(renderField)}
        </div>
      ) : (
        <div>
          {/* Hidden submit button at top to ensure form can be submitted with enter key */}
          <Button 
            type="submit" 
            className="hidden" 
            form={formId}
            disabled={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};

export default GenericForm;
