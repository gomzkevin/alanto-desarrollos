
import { FormValues } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FieldDefinition } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo } from 'react';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { LeadCombobox } from './LeadCombobox';

interface GenericFormProps {
  fields: FieldDefinition[];
  resource: FormValues | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  resourceType: string;
  resourceId?: string;
  desarrolloId?: string;
  prototipo_id?: string;
  lead_id?: string;
  handleDateChange?: (date: Date | undefined) => void;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmenitiesChange?: (amenities: string[]) => void;
  selectedDate?: Date;
  uploading?: boolean;
  selectedAmenities?: string[];
  handleLeadSelect?: (leadId: string, leadName: string) => void;
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
  resourceId,
  prototipo_id,
  lead_id,
  handleLeadSelect
}: GenericFormProps) {
  const { leads = [] } = useLeads({});
  const { desarrollos = [] } = useDesarrollos({});
  const { prototipos = [] } = usePrototipos({});
  
  const tabs = useMemo(() => {
    const uniqueTabs = new Set<string>();
    
    fields.forEach(field => {
      if (field.tab) {
        uniqueTabs.add(field.tab);
      }
    });
    
    return Array.from(uniqueTabs);
  }, [fields]);
  
  if (!resource) return null;
  
  // Determinar si debemos mostrar el formulario con pestañas o normal
  const hasTabs = tabs.length > 0;
  
  const renderFormFields = (tabName?: string) => {
    const fieldsToRender = hasTabs 
      ? fields.filter(field => field.tab === tabName)
      : fields;
    
    return (
      <div className="grid gap-4 py-4">
        {fieldsToRender.map((field) => (
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
            
            {field.type === 'select-lead' && (
              <LeadCombobox 
                value={(resource as any)[field.name] || ''}
                onChange={(leadId, leadName) => {
                  if (handleLeadSelect) {
                    handleLeadSelect(leadId, leadName);
                  } else {
                    handleSelectChange(field.name, leadId);
                  }
                }}
              />
            )}
            
            {field.type === 'select-desarrollo' && (
              <Select
                value={(resource as any)[field.name] || ''}
                onValueChange={(value) => handleSelectChange(field.name, value)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder={`Seleccione un desarrollo`} />
                </SelectTrigger>
                <SelectContent>
                  {desarrollos.map((desarrollo) => (
                    <SelectItem key={desarrollo.id} value={desarrollo.id}>
                      {desarrollo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {field.type === 'select-prototipo' && (
              <Select
                value={(resource as any)[field.name] || ''}
                onValueChange={(value) => handleSelectChange(field.name, value)}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder={`Seleccione un prototipo`} />
                </SelectTrigger>
                <SelectContent>
                  {prototipos
                    .filter(p => !desarrolloId || p.desarrollo_id === desarrolloId)
                    .map((prototipo) => (
                      <SelectItem key={prototipo.id} value={prototipo.id}>
                        {prototipo.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  if (hasTabs) {
    return (
      <Tabs defaultValue={tabs[0]}>
        <TabsList className="mb-4">
          {tabs.map(tab => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map(tab => (
          <TabsContent key={tab} value={tab}>
            {renderFormFields(tab)}
          </TabsContent>
        ))}
      </Tabs>
    );
  }
  
  return renderFormFields();
}
