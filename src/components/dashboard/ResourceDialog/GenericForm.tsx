
import { FormValues } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FieldDefinition } from './types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo, useState, useEffect } from 'react';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { ClientSearch } from './components/ClientSearch';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';

interface GenericFormProps {
  fields: FieldDefinition[];
  resource: FormValues | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (name: string, checked: boolean) => void;
  resourceType: string;
  handleDateChange?: (date: Date | undefined) => void;
  handleImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAmenitiesChange?: (amenities: string[]) => void;
  selectedDate?: Date;
  uploading?: boolean;
  selectedAmenities?: string[];
  handleLeadSelect?: (leadId: string, leadName: string) => void;
  isExistingClient?: boolean;
  onExistingClientChange?: (isExisting: boolean) => void;
  newClientData?: {
    nombre: string;
    email: string;
    telefono: string;
  };
  onNewClientDataChange?: (field: string, value: string) => void;
  onDesarrolloSelect?: (desarrolloId: string) => void;
  // Add missing properties
  desarrolloId?: string;
  resourceId?: string;
  prototipo_id?: string;
  lead_id?: string;
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
  handleLeadSelect,
  isExistingClient = true,
  onExistingClientChange,
  newClientData,
  onNewClientDataChange,
  onDesarrolloSelect
}: GenericFormProps) {
  const { leads = [] } = useLeads({});
  const { desarrollos = [] } = useDesarrollos({});
  
  // Obtener el desarrollo_id actualmente seleccionado en el formulario
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>(
    desarrolloId || (resource && (resource as any).desarrollo_id) || ''
  );
  
  // Use the selected desarrollo to fetch filtered prototipos
  const { prototipos = [] } = usePrototipos({
    desarrolloId: selectedDesarrolloId
  });

  // Actualizar selectedDesarrolloId cuando cambie el valor en el recurso o props
  useEffect(() => {
    if (resource && (resource as any).desarrollo_id) {
      setSelectedDesarrolloId((resource as any).desarrollo_id);
    } else if (desarrolloId) {
      setSelectedDesarrolloId(desarrolloId);
    }
  }, [resource, desarrolloId]);
  
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

  // Custom handler for desarrollo changes
  const handleDesarrolloChange = (value: string) => {
    setSelectedDesarrolloId(value);
    
    // Call parent handler if available
    if (onDesarrolloSelect) {
      onDesarrolloSelect(value);
    } else {
      // Fall back to standard handler
      handleSelectChange('desarrollo_id', value);
      
      // Reset prototipo when desarrollo changes
      if (resourceType === 'cotizaciones') {
        handleSelectChange('prototipo_id', '');
      }
    }
  };
  
  // Verificar si se está usando finiquito (solo para cotizaciones)
  const usarFiniquito = resourceType === 'cotizaciones' && (resource as any).usar_finiquito;
  
  const renderFormFields = (tabName?: string) => {
    const fieldsToRender = hasTabs 
      ? fields.filter(field => field.tab === tabName)
      : fields.filter(field => !field.tab);
    
    // Filtrar el campo de monto de finiquito si no se está usando finiquito
    const filteredFields = fieldsToRender.filter(field => {
      if (field.name === 'monto_finiquito' && !usarFiniquito) {
        return false;
      }
      return true;
    });
    
    return (
      <div className="grid gap-4 py-4">
        {/* Mostrar la búsqueda de cliente para cotizaciones y ocultar el campo select-lead */}
        {resourceType === 'cotizaciones' && !tabName && (
          <ClientSearch
            value={(resource as any).lead_id || ''}
            onSelect={(leadId, leadName) => {
              if (handleLeadSelect) {
                handleLeadSelect(leadId, leadName);
              } else {
                handleSelectChange('lead_id', leadId);
              }
            }}
            isExistingClient={isExistingClient || false}
            onExistingClientChange={(value) => {
              if (onExistingClientChange) {
                onExistingClientChange(value);
              }
            }}
            newClientData={newClientData}
            onNewClientDataChange={onNewClientDataChange}
          />
        )}
        
        {filteredFields.map((field) => {
          // Ocultar el campo select-lead si estamos en cotizaciones (lo reemplazamos por ClientSearch)
          if (resourceType === 'cotizaciones' && field.type === 'select-lead') {
            return null;
          }
          
          return (
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
              
              {field.type === 'image' && (
                <div className="space-y-4">
                  {(resource as any)[field.name] && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-100">
                      <img 
                        src={(resource as any)[field.name]} 
                        alt="Imagen" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          if (handleImageUpload) {
                            handleImageUpload(e as any);
                          }
                        };
                        input.click();
                      }}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Subir imagen
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              {field.type === 'select-lead' && resourceType !== 'cotizaciones' && (
                <ClientSearch 
                  value={(resource as any)[field.name] || ''}
                  onSelect={(leadId, leadName) => {
                    if (handleLeadSelect) {
                      handleLeadSelect(leadId, leadName);
                    } else {
                      handleSelectChange(field.name, leadId);
                    }
                  }}
                  isExistingClient={true}
                  onExistingClientChange={() => {}}
                />
              )}
              
              {field.type === 'select-desarrollo' && (
                <Select
                  value={(resource as any)[field.name] || ''}
                  onValueChange={(value) => handleDesarrolloChange(value)}
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
                  disabled={!selectedDesarrolloId}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder={
                      selectedDesarrolloId 
                        ? (prototipos.length > 0 
                            ? "Seleccione un prototipo" 
                            : "No hay prototipos disponibles")
                        : "Seleccione un desarrollo primero"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {prototipos.length > 0 ? (
                      prototipos.map((prototipo) => (
                        <SelectItem key={prototipo.id} value={prototipo.id}>
                          {prototipo.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem key="no-prototipos" value="no-prototipos" disabled>
                        {selectedDesarrolloId 
                          ? "No hay prototipos disponibles para este desarrollo" 
                          : "Seleccione un desarrollo primero"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  if (hasTabs) {
    return (
      <Tabs defaultValue="Principal">
        <TabsList className="mb-4">
          <TabsTrigger value="Principal">Principal</TabsTrigger>
          {tabs.map(tab => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="Principal">
          {renderFormFields()}
        </TabsContent>
        
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
