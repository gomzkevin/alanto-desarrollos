import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DesarrolloResource } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AmenitiesSelector } from '../AmenitiesSelector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DesarrolloFormProps {
  resource: DesarrolloResource | null;
  setResource: (resource: DesarrolloResource) => void;
  resourceId?: string;
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
}

export default function DesarrolloForm({
  resource,
  setResource,
  resourceId,
  selectedAmenities,
  onAmenitiesChange
}: DesarrolloFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  
  // Funciones para manejar cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!resource) return;
    
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Skip changes for read-only fields
    if (name === 'unidades_disponibles' || name === 'avance_porcentaje') {
      return;
    }
    
    if (type === 'number') {
      setResource({ ...resource, [name]: value === '' ? '' : Number(value) });
    } else {
      setResource({ ...resource, [name]: value });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!resource) return;
    setResource({ ...resource, [name]: value });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!resource) return;
    setResource({ ...resource, [name]: checked });
  };
  
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!resource || !date) return;
    setResource({ ...resource, [name]: date.toISOString() });
  };
  
  // Si no hay recurso, no renderizar nada
  if (!resource) return null;
  
  return (
    <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="general" className="text-center">General</TabsTrigger>
        <TabsTrigger value="amenidades" className="text-center">Amenidades</TabsTrigger>
        <TabsTrigger value="fechas" className="text-center">Fechas</TabsTrigger>
        <TabsTrigger value="media" className="text-center">Media</TabsTrigger>
        <TabsTrigger value="financiero" className="text-center">Financiero</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={(resource.nombre || '') as string}
              onChange={handleChange}
              placeholder="Nombre del desarrollo"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="ubicacion">Ubicación</Label>
            <Input
              id="ubicacion"
              name="ubicacion"
              value={(resource.ubicacion || '') as string}
              onChange={handleChange}
              placeholder="Ubicación del desarrollo"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="total_unidades">Total Unidades</Label>
            <Input
              id="total_unidades"
              name="total_unidades"
              type="number"
              value={(resource.total_unidades || '') as number}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="unidades_disponibles">Unidades Disponibles</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Unidades con estatus "Disponible". Campo calculado automáticamente.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="unidades_disponibles"
              name="unidades_disponibles"
              type="number"
              value={(resource.unidades_disponibles || '') as number}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              placeholder="0"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="avance_porcentaje">Avance Comercial (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Porcentaje de unidades vendidas, apartadas o en proceso de pago. Campo calculado automáticamente.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="avance_porcentaje"
              name="avance_porcentaje"
              type="number"
              value={(resource.avance_porcentaje || '') as number}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              placeholder="0"
            />
          </div>
          
          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={(resource.descripcion || '') as string}
              onChange={handleChange}
              placeholder="Descripción del desarrollo"
              className="min-h-[120px]"
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="amenidades" className="space-y-4 pt-2">
        <div className="space-y-3">
          <Label>Amenidades</Label>
          <AmenitiesSelector 
            selectedAmenities={selectedAmenities} 
            onChange={onAmenitiesChange} 
          />
        </div>
      </TabsContent>
      
      <TabsContent value="fechas" className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !resource.fecha_inicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {resource.fecha_inicio ? 
                    format(new Date(resource.fecha_inicio as string), "PPP") : 
                    "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={resource.fecha_inicio ? new Date(resource.fecha_inicio as string) : undefined}
                  onSelect={(date) => handleDateChange('fecha_inicio', date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !resource.fecha_entrega && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {resource.fecha_entrega ? 
                    format(new Date(resource.fecha_entrega as string), "PPP") : 
                    "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={resource.fecha_entrega ? new Date(resource.fecha_entrega as string) : undefined}
                  onSelect={(date) => handleDateChange('fecha_entrega', date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="media" className="space-y-4 pt-2">
        <div className="space-y-3">
          <Label htmlFor="imagen_url">Imagen URL</Label>
          <Input
            id="imagen_url"
            name="imagen_url"
            value={(resource.imagen_url || '') as string}
            onChange={handleChange}
            placeholder="URL de la imagen"
          />
          {resourceId && (
            <p className="text-sm text-gray-500">
              Las imágenes del desarrollo se gestionan directamente desde la vista de detalle del desarrollo.
            </p>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="financiero" className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="moneda">Moneda</Label>
            <Select 
              value={(resource.moneda || 'MXN') as string}
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
          
          <div className="space-y-3">
            <Label htmlFor="comision_operador">Comisión Operador (%)</Label>
            <Input
              id="comision_operador"
              name="comision_operador"
              type="number"
              value={(resource.comision_operador || '') as number}
              onChange={handleChange}
              placeholder="15"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="mantenimiento_valor">Mantenimiento</Label>
            <Input
              id="mantenimiento_valor"
              name="mantenimiento_valor"
              type="number"
              value={(resource.mantenimiento_valor || '') as number}
              onChange={handleChange}
              placeholder="5"
            />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <Label htmlFor="es_mantenimiento_porcentaje">Mantenimiento es porcentaje</Label>
            <Switch
              id="es_mantenimiento_porcentaje"
              checked={Boolean(resource.es_mantenimiento_porcentaje)}
              onCheckedChange={(checked) => handleSwitchChange('es_mantenimiento_porcentaje', checked)}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="gastos_fijos">Gastos Fijos</Label>
            <Input
              id="gastos_fijos"
              name="gastos_fijos"
              type="number"
              value={(resource.gastos_fijos || '') as number}
              onChange={handleChange}
              placeholder="2500"
            />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <Label htmlFor="es_gastos_fijos_porcentaje">Gastos Fijos es porcentaje</Label>
            <Switch
              id="es_gastos_fijos_porcentaje"
              checked={Boolean(resource.es_gastos_fijos_porcentaje)}
              onCheckedChange={(checked) => handleSwitchChange('es_gastos_fijos_porcentaje', checked)}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="gastos_variables">Gastos Variables (%)</Label>
            <Input
              id="gastos_variables"
              name="gastos_variables"
              type="number"
              value={(resource.gastos_variables || '') as number}
              onChange={handleChange}
              placeholder="12"
            />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <Label htmlFor="es_gastos_variables_porcentaje">Gastos Variables es porcentaje</Label>
            <Switch
              id="es_gastos_variables_porcentaje"
              checked={Boolean(resource.es_gastos_variables_porcentaje)}
              onCheckedChange={(checked) => handleSwitchChange('es_gastos_variables_porcentaje', checked)}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="impuestos">Impuestos (%)</Label>
            <Input
              id="impuestos"
              name="impuestos"
              type="number"
              value={(resource.impuestos || '') as number}
              onChange={handleChange}
              placeholder="35"
            />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <Label htmlFor="es_impuestos_porcentaje">Impuestos es porcentaje</Label>
            <Switch
              id="es_impuestos_porcentaje"
              checked={Boolean(resource.es_impuestos_porcentaje)}
              onCheckedChange={(checked) => handleSwitchChange('es_impuestos_porcentaje', checked)}
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="adr_base">ADR Base</Label>
            <Input
              id="adr_base"
              name="adr_base"
              type="number"
              value={(resource.adr_base || '') as number}
              onChange={handleChange}
              placeholder="1800"
            />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="ocupacion_anual">Ocupación Anual (%)</Label>
            <Input
              id="ocupacion_anual"
              name="ocupacion_anual"
              type="number"
              value={(resource.ocupacion_anual || '') as number}
              onChange={handleChange}
              placeholder="70"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
