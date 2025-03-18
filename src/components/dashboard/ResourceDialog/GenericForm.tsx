
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AmenitiesSelector } from '../AmenitiesSelector';
import { FieldDefinition, FormValues } from './types';
import ImageUploader from '../ImageUploader';

interface GenericFormProps {
  fields: FieldDefinition[];
  values: FormValues;
  onChange: (values: FormValues) => void;
  onSelectChange?: (name: string, value: string) => void;
  onSwitchChange?: (name: string, checked: boolean) => void;
  onLeadSelect?: (leadId: string, leadName: string) => void;
  onDateChange?: (name: string, date: Date | undefined) => void;
  onAmenitiesChange?: (amenities: string[]) => void;
  isSubmitting?: boolean;
  onSubmit?: () => void;
  formId: string;
  selectedAmenities?: string[];
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
  formId,
  isSubmitting = false,
  onSubmit,
  selectedAmenities = []
}: GenericFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  
  console.log("GenericForm render with fields:", fields);
  console.log("GenericForm values:", values);

  const generateValidationSchema = () => {
    const schema: { [key: string]: any } = {};
    
    fields.forEach((field) => {
      if (field.type === 'text' || field.type === 'textarea' || field.type === 'email') {
        schema[field.name] = z.string().optional();
      } else if (field.type === 'number') {
        schema[field.name] = z.number().optional();
      } else if (field.type === 'select') {
        schema[field.name] = z.string().optional();
      } else if (field.type === 'date') {
        schema[field.name] = z.string().optional();
      } else if (field.type === 'switch') {
        schema[field.name] = z.boolean().optional();
      } else if (field.type === 'amenities') {
        schema[field.name] = z.array(z.string()).optional();
      } else if (field.type === 'image-upload' || field.type === 'upload') {
        schema[field.name] = z.string().optional();
      }
    });
    
    return z.object(schema);
  };

  const validationSchema = generateValidationSchema();
  type ValidationSchema = z.infer<typeof validationSchema>;

  const form = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
    defaultValues: values as any,
  });

  useEffect(() => {
    console.log("Resetting form with values:", values);
    form.reset(values as any);
  }, [form, values]);

  const onFormChange = (name: string, value: any) => {
    console.log("Form change:", name, value);
    
    // Create new object with just the changed field
    const updatedValues = { [name]: value };
    onChange(updatedValues);
    
    // Call the appropriate handler based on field type
    if (onSelectChange && fields.some(field => field.name === name && (field.type === 'select' || field.type === 'select-lead'))) {
      onSelectChange(name, value as string);
    }
    
    if (onSwitchChange && fields.some(field => field.name === name && field.type === 'switch')) {
      onSwitchChange(name, value as boolean);
    }
    
    if (onDateChange && fields.some(field => field.name === name && field.type === 'date')) {
      onDateChange(name, value as Date | undefined);
    }
  };

  useEffect(() => {
    const uniqueTabs = fields
      .filter(field => field.tab)
      .map(field => field.tab as string)
      .filter((value, index, self) => self.indexOf(value) === index)
      .map(tab => ({ id: tab, label: tab.charAt(0).toUpperCase() + tab.slice(1) }));
    
    if (uniqueTabs.length > 0) {
      setTabs(uniqueTabs);
    } else {
      setTabs([{ id: 'general', label: 'General' }]);
    }
  }, [fields]);

  const renderField = (field: FieldDefinition) => {
    if (!field.tab || field.tab === activeTab) {
      return (
        <FormField
          key={field.name}
          control={form.control}
          name={field.name as any}
          render={({ field: formField }) => (
            <FormItem className="mb-4">
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                {field.type === 'text' || field.type === 'email' ? (
                  <Input
                    type={field.type}
                    {...formField}
                    readOnly={field.readOnly}
                    className={field.readOnly ? "bg-gray-100" : ""}
                    onChange={(e) => {
                      formField.onChange(e);
                      if (!field.readOnly) {
                        onFormChange(field.name, e.target.value);
                      }
                    }}
                  />
                ) : field.type === 'number' ? (
                  <Input
                    type="number"
                    {...formField}
                    readOnly={field.readOnly}
                    className={field.readOnly ? "bg-gray-100" : ""}
                    value={formField.value === undefined ? '' : formField.value}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : Number(e.target.value);
                      formField.onChange(value);
                      if (!field.readOnly) {
                        onFormChange(field.name, value);
                      }
                    }}
                  />
                ) : field.type === 'textarea' ? (
                  <Textarea
                    {...formField}
                    readOnly={field.readOnly}
                    className={field.readOnly ? "bg-gray-100" : ""}
                    onChange={(e) => {
                      formField.onChange(e);
                      if (!field.readOnly) {
                        onFormChange(field.name, e.target.value);
                      }
                    }}
                  />
                ) : field.type === 'select' && field.options ? (
                  <Select
                    value={formField.value?.toString() || ''}
                    disabled={field.readOnly}
                    onValueChange={(value) => {
                      console.log(`Select change for ${field.name}:`, value);
                      formField.onChange(value);
                      if (!field.readOnly) {
                        onFormChange(field.name, value);
                      }
                    }}
                  >
                    <SelectTrigger className={field.readOnly ? "bg-gray-100" : ""}>
                      <SelectValue placeholder={`Seleccionar ${field.label}...`} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'date' ? (
                  <Input
                    type="date"
                    {...formField}
                    readOnly={field.readOnly}
                    className={field.readOnly ? "bg-gray-100" : ""}
                    onChange={(e) => {
                      formField.onChange(e);
                      if (!field.readOnly) {
                        onFormChange(field.name, e.target.value);
                      }
                    }}
                  />
                ) : field.type === 'switch' ? (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formField.value || false}
                      disabled={field.readOnly}
                      onCheckedChange={(checked) => {
                        formField.onChange(checked);
                        if (!field.readOnly) {
                          onFormChange(field.name, checked);
                        }
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      {formField.value ? 'Activado' : 'Desactivado'}
                    </span>
                  </div>
                ) : field.type === 'amenities' ? (
                  <AmenitiesSelector
                    selectedAmenities={selectedAmenities}
                    onChange={onAmenitiesChange || (() => {})}
                  />
                ) : field.type === 'image-upload' ? (
                  <ImageUploader
                    entityId={values.id || 'new'}
                    bucketName={field.bucket || 'prototipo-images'}
                    folderPath={field.folder || 'general'}
                    currentImageUrl={formField.value as string}
                    onImageUploaded={(imageUrl) => {
                      formField.onChange(imageUrl);
                      if (!field.readOnly) {
                        onFormChange(field.name, imageUrl);
                      }
                    }}
                  />
                ) : null}
              </FormControl>
              {field.readOnly && (
                <p className="text-xs text-gray-500 mt-1">
                  Este campo se actualiza automáticamente basado en el estado de las unidades
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    return null;
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit || (() => {}))}>
        {tabs.length > 1 ? (
          <Tabs defaultValue={tabs[0].id} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="py-4">
                {fields.filter(field => field.tab === tab.id).map(renderField)}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-4 py-2">
            {fields.map(renderField)}
          </div>
        )}
      </form>
    </Form>
  );
};

export default GenericForm;
