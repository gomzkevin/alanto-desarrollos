
import { DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { FormValues, ResourceType, DesarrolloResource } from '../types';
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
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('Principal');
  
  // Helper function to convert resource object to values object for GenericForm
  const getFormValues = () => {
    if (!resource) return {};
    return resource;
  };

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

  const getFieldsByTab = (tabName: string) => {
    return fields.filter(field => {
      if (tabName === 'Principal') {
        return !field.tab;
      }
      return field.tab === tabName;
    });
  };

  // Create an adapter function for onChange to match expected signature in GenericForm
  const handleFormChange = (name: string, value: any) => {
    // Create a synthetic event object
    const syntheticEvent = {
      target: {
        name,
        value
      }
    } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    
    handleChange(syntheticEvent);
  };
  
  const renderDesarrolloForm = () => {
    // Only render this form for "desarrollos" resource type
    if (!resource || resourceType !== 'desarrollos') return null;
    
    // Type assertion to access DesarrolloResource properties
    const desarrolloResource = resource as DesarrolloResource;
    
    return (
      <Tabs defaultValue="Principal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="Principal">Principal</TabsTrigger>
          <TabsTrigger value="Fechas">Fechas</TabsTrigger>
          <TabsTrigger value="Finanzas">Finanzas</TabsTrigger>
          <TabsTrigger value="Rendimiento">Rendimiento</TabsTrigger>
          <TabsTrigger value="Amenidades">Amenidades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="Principal" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                value={desarrolloResource.nombre || ''}
                onChange={handleChange}
                placeholder="Nombre del desarrollo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                name="ubicacion"
                value={desarrolloResource.ubicacion || ''}
                onChange={handleChange}
                placeholder="Ubicación del desarrollo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total_unidades">Total Unidades</Label>
              <Input
                id="total_unidades"
                name="total_unidades"
                type="number"
                value={desarrolloResource.total_unidades || ''}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unidades_disponibles">Unidades Disponibles</Label>
              <Input
                id="unidades_disponibles"
                name="unidades_disponibles"
                type="number"
                value={desarrolloResource.unidades_disponibles || ''}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avance_porcentaje">Avance (%)</Label>
              <Input
                id="avance_porcentaje"
                name="avance_porcentaje"
                type="number"
                value={desarrolloResource.avance_porcentaje || ''}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={desarrolloResource.descripcion || ''}
                onChange={handleChange}
                placeholder="Descripción del desarrollo"
                className="min-h-[120px]"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="Fechas" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !desarrolloResource.fecha_inicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {desarrolloResource.fecha_inicio ? 
                      format(new Date(desarrolloResource.fecha_inicio), "PP") : 
                      "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={desarrolloResource.fecha_inicio ? new Date(desarrolloResource.fecha_inicio) : undefined}
                    onSelect={(date) => handleDateChange && handleDateChange('fecha_inicio', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !desarrolloResource.fecha_entrega && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {desarrolloResource.fecha_entrega ? 
                      format(new Date(desarrolloResource.fecha_entrega), "PP") : 
                      "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={desarrolloResource.fecha_entrega ? new Date(desarrolloResource.fecha_entrega) : undefined}
                    onSelect={(date) => handleDateChange && handleDateChange('fecha_entrega', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="Finanzas" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="moneda">Moneda</Label>
              <Select 
                value={desarrolloResource.moneda || 'MXN'}
                onValueChange={(value) => handleSelectChange('moneda', value)}
              >
                <SelectTrigger id="moneda">
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                  <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comision_operador">Comisión Operador (%)</Label>
              <Input
                id="comision_operador"
                name="comision_operador"
                type="number"
                value={desarrolloResource.comision_operador || ''}
                onChange={handleChange}
                placeholder="15"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mantenimiento_valor">Mantenimiento</Label>
              <Input
                id="mantenimiento_valor"
                name="mantenimiento_valor"
                type="number"
                value={desarrolloResource.mantenimiento_valor || ''}
                onChange={handleChange}
                placeholder="5"
              />
            </div>
            
            <div className="flex items-center justify-between py-4">
              <Label htmlFor="es_mantenimiento_porcentaje">Mantenimiento es porcentaje</Label>
              <Switch
                id="es_mantenimiento_porcentaje"
                checked={Boolean(desarrolloResource.es_mantenimiento_porcentaje)}
                onCheckedChange={(checked) => handleSwitchChange('es_mantenimiento_porcentaje', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gastos_fijos">Gastos Fijos</Label>
              <Input
                id="gastos_fijos"
                name="gastos_fijos"
                type="number"
                value={desarrolloResource.gastos_fijos || ''}
                onChange={handleChange}
                placeholder="2500"
              />
            </div>
            
            <div className="flex items-center justify-between py-4">
              <Label htmlFor="es_gastos_fijos_porcentaje">Gastos Fijos es porcentaje</Label>
              <Switch
                id="es_gastos_fijos_porcentaje"
                checked={Boolean(desarrolloResource.es_gastos_fijos_porcentaje)}
                onCheckedChange={(checked) => handleSwitchChange('es_gastos_fijos_porcentaje', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gastos_variables">Gastos Variables</Label>
              <Input
                id="gastos_variables"
                name="gastos_variables"
                type="number"
                value={desarrolloResource.gastos_variables || ''}
                onChange={handleChange}
                placeholder="12"
              />
            </div>
            
            <div className="flex items-center justify-between py-4">
              <Label htmlFor="es_gastos_variables_porcentaje">Gastos Variables es porcentaje</Label>
              <Switch
                id="es_gastos_variables_porcentaje"
                checked={Boolean(desarrolloResource.es_gastos_variables_porcentaje)}
                onCheckedChange={(checked) => handleSwitchChange('es_gastos_variables_porcentaje', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="impuestos">Impuestos</Label>
              <Input
                id="impuestos"
                name="impuestos"
                type="number"
                value={desarrolloResource.impuestos || ''}
                onChange={handleChange}
                placeholder="35"
              />
            </div>
            
            <div className="flex items-center justify-between py-4">
              <Label htmlFor="es_impuestos_porcentaje">Impuestos es porcentaje</Label>
              <Switch
                id="es_impuestos_porcentaje"
                checked={Boolean(desarrolloResource.es_impuestos_porcentaje)}
                onCheckedChange={(checked) => handleSwitchChange('es_impuestos_porcentaje', checked)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="Rendimiento" className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="adr_base">ADR Base</Label>
              <Input
                id="adr_base"
                name="adr_base"
                type="number"
                value={desarrolloResource.adr_base || ''}
                onChange={handleChange}
                placeholder="1800"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ocupacion_anual">Ocupación Anual (%)</Label>
              <Input
                id="ocupacion_anual"
                name="ocupacion_anual"
                type="number"
                value={desarrolloResource.ocupacion_anual || ''}
                onChange={handleChange}
                placeholder="70"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="Amenidades" className="space-y-4 py-4">
          <div className="space-y-4">
            <Label>Amenidades</Label>
            {handleAmenitiesChange && (
              <AmenitiesSelector
                selectedAmenities={selectedAmenities}
                onChange={handleAmenitiesChange}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  const renderMediaSection = () => {
    if (!resource) return null;
    
    return (
      <div className="space-y-4 py-4">
        <Label>Imagen</Label>
        <div className="space-y-4">
          {(resource as any).imagen_url && (
            <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-100">
              <img 
                src={(resource as any).imagen_url} 
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
      </div>
    );
  };

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader
        title={`${resourceId ? 'Editar' : 'Nuevo'} ${getResourceTypeName()}`}
        description={`${resourceId ? 'Editar la información del' : 'Crear un nuevo'} ${getResourceTypeName().toLowerCase()}`}
      />
      
      {isLoading ? (
        <div className="py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : resourceType === 'desarrollos' ? (
        renderDesarrolloForm()
      ) : (
        <GenericForm
          fields={fields}
          values={getFormValues()}
          onChange={handleFormChange}
          onSelectChange={handleSelectChange}
          onSwitchChange={handleSwitchChange}
          onLeadSelect={handleLeadSelect}
          onDateChange={handleDateChange || (() => {})}
          onAmenitiesChange={handleAmenitiesChange}
          selectedAmenities={selectedAmenities}
          isSubmitting={isSubmitting}
          onSubmit={saveResource}
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
