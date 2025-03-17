
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldDefinition } from './types';
import { AmenitiesSelector } from '@/components/dashboard/AmenitiesSelector';
import { ClientSearch } from './components/ClientSearch';
import InterestSelector from './components/InterestSelector';
import useLeads from '@/hooks/useLeads';

interface GenericFormProps {
  fields: FieldDefinition[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSelectChange: (name: string, value: string) => void;
  onSwitchChange: (name: string, checked: boolean) => void;
  onLeadSelect?: (leadId: string, leadName: string) => void;
  onDateChange: (name: string, date: Date | undefined) => void;
  onAmenitiesChange?: (amenities: string[]) => void;
  selectedAmenities?: string[];
  isSubmitting?: boolean;
  onSubmit: () => void;
}

const GenericForm = ({
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
}: GenericFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [groupedFields, setGroupedFields] = useState<Record<string, FieldDefinition[]>>({});
  const { getSubstatusOptions } = useLeads({});
  const [substatusOptions, setSubstatusOptions] = useState<Array<{value: string, label: string}>>([]);

  // Update subestado options when estado changes
  useEffect(() => {
    if (values.estado) {
      const options = getSubstatusOptions(values.estado);
      setSubstatusOptions(options);
    }
  }, [values.estado, getSubstatusOptions]);

  // Group fields by tab
  useEffect(() => {
    const grouped: Record<string, FieldDefinition[]> = {};
    
    fields.forEach(field => {
      const tab = field.tab || 'general';
      if (!grouped[tab]) {
        grouped[tab] = [];
      }
      grouped[tab].push(field);
    });
    
    setGroupedFields(grouped);
    
    // Set first tab as active if it exists and no active tab is set
    const tabs = Object.keys(grouped);
    if (tabs.length > 0 && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [fields, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Fixed type mismatch by creating adapter functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name, e.target.value);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.name, e.target.value);
  };

  const renderField = (field: FieldDefinition) => {
    const { name, label, type, options = [] } = field;
    const value = values[name] !== undefined ? values[name] : '';

    // For subestado field, use dynamic options
    const fieldOptions = name === 'subestado' ? substatusOptions : options;

    switch (type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <div key={name} className="grid gap-2 py-2">
            <Label htmlFor={name} className="text-gray-800 font-medium">{label}</Label>
            <Input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={handleInputChange}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            />
          </div>
        );
        
      case 'date':
        return (
          <div key={name} className="grid gap-2 py-2">
            <Label htmlFor={name} className="text-gray-800 font-medium">{label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border border-gray-300 rounded-md shadow-sm",
                    !value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), 'PP', { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => onDateChange(name, date)}
                  initialFocus
                  locale={es}
                  className="rounded-md shadow-md border border-gray-100"
                />
              </PopoverContent>
            </Popover>
          </div>
        );
        
      case 'textarea':
        return (
          <div key={name} className="grid gap-2 py-2">
            <Label htmlFor={name} className="text-gray-800 font-medium">{label}</Label>
            <Textarea
              id={name}
              name={name}
              value={value || ''}
              onChange={handleTextareaChange}
              className="min-h-[100px] resize-y border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            />
          </div>
        );
        
      case 'select':
        return (
          <div key={name} className="grid gap-2 py-2">
            <Label htmlFor={name} className="text-gray-800 font-medium">{label}</Label>
            <Select
              value={value}
              onValueChange={(value) => onSelectChange(name, value)}
            >
              <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                <SelectValue placeholder={`Seleccionar ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-md shadow-md border border-gray-100">
                {fieldOptions.map((option) => (
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
          <div key={name} className="flex items-center justify-between py-2">
            <Label htmlFor={name} className="text-gray-800 font-medium">{label}</Label>
            <Switch
              id={name}
              checked={value || false}
              onCheckedChange={(checked) => onSwitchChange(name, checked)}
            />
          </div>
        );
        
      case 'amenities':
        return (
          <div key={name} className="grid gap-2 py-2">
            <Label className="text-gray-800 font-medium">{label}</Label>
            {onAmenitiesChange && (
              <AmenitiesSelector
                selectedAmenities={selectedAmenities}
                onChange={onAmenitiesChange}
              />
            )}
          </div>
        );
        
      case 'select-lead':
        return (
          <div key={name} className="grid gap-2 py-2">
            <Label className="text-gray-800 font-medium">{label}</Label>
            {onLeadSelect && (
              <ClientSearch
                onClientSelect={(leadId, leadName) => onLeadSelect(leadId, leadName)}
                value={value}
                isExistingClient={true}
                onExistingClientChange={() => {}}
              />
            )}
          </div>
        );
        
      case 'interest-selector':
        return (
          <div key={name} className="grid gap-2 py-2">
            <Label className="text-gray-800 font-medium">{label}</Label>
            <InterestSelector
              value={value || ''}
              onChange={(newValue) => onSelectChange(name, newValue)}
              className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  const tabs = Object.keys(groupedFields);
  
  if (tabs.length <= 1) {
    // Only one tab, render fields directly
    return (
      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-4 rounded-lg shadow-sm">
        <div className="space-y-4">
          {fields.map(field => renderField(field))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    );
  }
  
  // Multiple tabs, render tabbed interface
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-t-lg w-full flex overflow-x-auto">
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="capitalize data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md flex-1"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tabs.map(tab => (
          <TabsContent key={tab} value={tab} className="p-6 space-y-4">
            <div className="space-y-4">
              {groupedFields[tab]?.map(field => renderField(field))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="p-4 flex justify-end border-t border-gray-100">
        <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-24">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};

export default GenericForm;
