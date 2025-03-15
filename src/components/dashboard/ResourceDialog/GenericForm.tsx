
import { FormValues } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FieldDefinition } from './types';

interface GenericFormProps {
  fields: FieldDefinition[];
  resource: FormValues | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  resourceType: string;
  resourceId?: string;
  desarrolloId?: string;
  handleDateChange?: (date: Date | undefined) => void;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmenitiesChange?: (amenities: string[]) => void;
  selectedDate?: Date;
  uploading?: boolean;
  selectedAmenities?: string[];
}

export default function GenericForm({
  fields,
  resource,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  resourceType,
  handleDateChange,
  handleImageUpload,
  handleAmenitiesChange,
  selectedDate,
  uploading,
  selectedAmenities,
  desarrolloId,
  resourceId
}: GenericFormProps) {
  if (!resource) return null;
  
  return (
    <div className="grid gap-4 py-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          
          {field.type === 'text' && (
            <Input
              id={field.name}
              name={field.name}
              value={(resource as any)[field.name] || ''}
              onChange={handleChange}
              placeholder={`Ingrese ${field.label.toLowerCase()}`}
            />
          )}
          
          {field.type === 'number' && (
            <Input
              id={field.name}
              name={field.name}
              type="number"
              value={(resource as any)[field.name] || ''}
              onChange={handleChange}
              placeholder="0"
            />
          )}
          
          {field.type === 'textarea' && (
            <Textarea
              id={field.name}
              name={field.name}
              value={(resource as any)[field.name] || ''}
              onChange={handleChange}
              placeholder={`Ingrese ${field.label.toLowerCase()}`}
              className="min-h-[120px]"
            />
          )}
          
          {field.type === 'select' && field.options && (
            <Select
              value={(resource as any)[field.name] || ''}
              onValueChange={(value) => handleSelectChange(field.name, value)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue placeholder={`Seleccione ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {field.type === 'switch' && (
            <div className="flex items-center justify-between">
              <Switch
                id={field.name}
                checked={Boolean((resource as any)[field.name])}
                onCheckedChange={(checked) => handleSwitchChange(field.name, checked)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
