
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ResourceType = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones';

export interface AdminResourceDialogProps {
  open?: boolean;
  onClose?: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSave?: () => void;
  buttonText?: string;
  onSuccess?: () => void;
  desarrolloId?: string;
  lead_id?: string;
}

interface DesarrolloResource {
  id?: string;
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  avance_porcentaje?: number;
  fecha_inicio?: string;
  fecha_entrega?: string;
  descripcion?: string;
  imagen_url?: string;
  moneda?: string;
  comision_operador?: number;
  mantenimiento_valor?: number;
  es_mantenimiento_porcentaje?: boolean;
  gastos_fijos?: number;
  es_gastos_fijos_porcentaje?: boolean;
  gastos_variables?: number;
  es_gastos_variables_porcentaje?: boolean;
  impuestos?: number;
  es_impuestos_porcentaje?: boolean;
  adr_base?: number;
  ocupacion_anual?: number;
}

interface PrototipoResource {
  id?: string;
  nombre: string;
  tipo: string;
  precio: number;
  superficie?: number;
  habitaciones?: number;
  baños?: number;
  total_unidades: number;
  unidades_disponibles: number;
  unidades_vendidas?: number;
  unidades_con_anticipo?: number;
  desarrollo_id: string;
  descripcion?: string;
  imagen_url?: string;
}

interface LeadResource {
  id?: string;
  nombre: string;
  email?: string;
  telefono?: string;
  interes_en?: string;
  origen?: string;
  estado?: string;
  subestado?: string;
  agente?: string;
  notas?: string;
  fecha_creacion?: string;
  ultimo_contacto?: string;
}

interface CotizacionResource {
  id?: string;
  lead_id: string;
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito?: boolean;
  monto_finiquito?: number;
  notas?: string;
  created_at?: string;
}

type FormValues = DesarrolloResource | PrototipoResource | LeadResource | CotizacionResource;

const TIPOS_PROPIEDADES = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'villa', label: 'Villa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'otro', label: 'Otro' },
];

const AdminResourceDialog = ({ 
  open, 
  onClose, 
  resourceType, 
  resourceId, 
  onSave,
  buttonText,
  onSuccess,
  desarrolloId,
  lead_id
}: AdminResourceDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<FormValues | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(desarrolloId || null);
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const { leads, statusOptions, getSubstatusOptions, originOptions } = useLeads();
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ 
    desarrolloId: selectedDesarrolloId 
  });

  const isOpen = open !== undefined ? open : dialogOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  useEffect(() => {
    const fetchResource = async () => {
      if (resourceId) {
        let query;
        
        if (resourceType === 'desarrollos') {
          query = supabase
            .from('desarrollos')
            .select('*')
            .eq('id', resourceId)
            .single();
        } else if (resourceType === 'prototipos') {
          query = supabase
            .from('prototipos')
            .select('*')
            .eq('id', resourceId)
            .single();
        } else if (resourceType === 'leads') {
          query = supabase
            .from('leads')
            .select('*')
            .eq('id', resourceId)
            .single();
        } else if (resourceType === 'cotizaciones') {
          query = supabase
            .from('cotizaciones')
            .select('*')
            .eq('id', resourceId)
            .single();
        }
        
        const { data, error } = await query;

        if (error) {
          console.error('Error fetching resource:', error);
          toast({
            title: 'Error',
            description: `No se pudo cargar el recurso: ${error.message}`,
            variant: 'destructive',
          });
        } else {
          setResource(data as FormValues);
          
          if (resourceType === 'leads') {
            if (data.estado) {
              setSelectedStatus(data.estado);
            }
            
            if (data.ultimo_contacto) {
              setSelectedDate(new Date(data.ultimo_contacto));
            }
          }
          
          if (resourceType === 'cotizaciones') {
            setSelectedDesarrolloId(data.desarrollo_id);
            setUsarFiniquito(data.usar_finiquito || false);
          } else if (resourceType === 'prototipos' && data.desarrollo_id) {
            setSelectedDesarrolloId(data.desarrollo_id);
          }
        }
      } else {
        if (resourceType === 'prototipos' && desarrolloId) {
          setResource({
            desarrollo_id: desarrolloId,
            nombre: '',
            tipo: '',
            precio: 0,
            total_unidades: 0,
            unidades_disponibles: 0,
            unidades_vendidas: 0,
            unidades_con_anticipo: 0
          } as PrototipoResource);
        } else if (resourceType === 'desarrollos') {
          setResource({
            nombre: '',
            ubicacion: '',
            total_unidades: 0,
            unidades_disponibles: 0
          } as DesarrolloResource);
        } else if (resourceType === 'leads') {
          setResource({
            nombre: '',
            estado: 'nuevo',
            subestado: 'sin_contactar'
          } as LeadResource);
          setSelectedStatus('nuevo');
          setSelectedDate(new Date());
        } else if (resourceType === 'cotizaciones') {
          setResource({
            lead_id: lead_id || '',
            desarrollo_id: selectedDesarrolloId || '',
            prototipo_id: '',
            monto_anticipo: 0,
            numero_pagos: 0
          } as CotizacionResource);
        }
      }
    };

    const defineFields = () => {
      let fieldDefinitions: any[] = [];

      switch (resourceType) {
        case 'desarrollos':
          fieldDefinitions = [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'ubicacion', label: 'Ubicación', type: 'text' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' },
            { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number' },
            { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number' },
            { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
            { name: 'fecha_entrega', label: 'Fecha Entrega', type: 'date' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'imagen_url', label: 'Imagen URL', type: 'text' },
          ];
          break;
        case 'prototipos':
          fieldDefinitions = [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_PROPIEDADES },
            { name: 'precio', label: 'Precio', type: 'number' },
            { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
            { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
            { name: 'baños', label: 'Baños', type: 'number' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' },
            { name: 'unidades_vendidas', label: 'Unidades Vendidas', type: 'number' },
            { name: 'unidades_con_anticipo', label: 'Unidades con Anticipo', type: 'number' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'imagen_url', label: 'Imagen URL', type: 'text' },
          ];
          break;
        case 'leads':
          fieldDefinitions = [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'agente', label: 'Agente', type: 'text' },
            { name: 'estado', label: 'Estado', type: 'select', options: statusOptions },
            { name: 'subestado', label: 'Subestado', type: 'select', options: selectedStatus ? getSubstatusOptions(selectedStatus) : [] },
            { name: 'origen', label: 'Origen', type: 'select', options: originOptions },
            { name: 'interes_en', label: 'Interés en', type: 'text' },
            { name: 'ultimo_contacto', label: 'Última fecha de contacto', type: 'date' },
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
          break;
        case 'cotizaciones':
          fieldDefinitions = [
            { name: 'lead_id', label: 'Lead', type: 'select', options: leads.map(lead => ({ value: lead.id, label: `${lead.nombre} ${lead.email ? `(${lead.email})` : lead.telefono ? `(${lead.telefono})` : ''}` })) },
            { name: 'desarrollo_id', label: 'Desarrollo', type: 'select', options: desarrollos.map(desarrollo => ({ value: desarrollo.id, label: desarrollo.nombre })) },
            { name: 'prototipo_id', label: 'Prototipo', type: 'select', options: prototipos.map(prototipo => ({ value: prototipo.id, label: prototipo.nombre })) },
            { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch' },
            { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number' },
            { name: 'numero_pagos', label: 'Número de Pagos', type: 'number' },
            ...(usarFiniquito ? [{ name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number' }] : []),
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
          break;
        default:
          fieldDefinitions = [];
          break;
      }

      setFields(fieldDefinitions);
    };

    if (isOpen) {
      fetchResource();
      defineFields();
    }
  }, [isOpen, resourceId, resourceType, toast, leads, desarrollos, prototipos, usarFiniquito, desarrolloId, selectedDesarrolloId, lead_id, statusOptions, getSubstatusOptions, originOptions, selectedStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (resource) {
      setResource({ ...resource, [name]: value } as FormValues);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (resource) {
      setResource({ ...resource, [name]: value } as FormValues);
      
      if (name === 'desarrollo_id') {
        setSelectedDesarrolloId(value);
        if (resource) {
          setResource({ ...resource, prototipo_id: '' } as FormValues);
        }
      }
      
      if (name === 'estado') {
        setSelectedStatus(value);
        setResource({ ...resource, subestado: '' } as FormValues);
      }
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    if (resource) {
      setResource({ ...resource, [name]: checked } as FormValues);
      
      if (name === 'usar_finiquito') {
        setUsarFiniquito(checked);
      }
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && resource) {
      setResource({ ...resource, ultimo_contacto: date.toISOString() } as FormValues);
    }
  };

  const saveResource = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let result;
      
      const dataToSave = { ...values };
      
      if (resourceType === 'prototipos') {
        const prototipoData = dataToSave as PrototipoResource;
        
        if (desarrolloId && !resourceId) {
          prototipoData.desarrollo_id = desarrolloId;
        }
        
        if (prototipoData.total_unidades !== undefined) {
          const total = Number(prototipoData.total_unidades) || 0;
          const vendidas = Number(prototipoData.unidades_vendidas) || 0;
          const anticipos = Number(prototipoData.unidades_con_anticipo) || 0;
          prototipoData.unidades_disponibles = total - vendidas - anticipos;
        }
        
        const { unidades_vendidas, unidades_con_anticipo, ...dataToModify } = prototipoData;
        
        if (!resourceId) {
          result = await supabase
            .from('prototipos')
            .insert({
              nombre: dataToModify.nombre,
              tipo: dataToModify.tipo,
              precio: dataToModify.precio,
              superficie: dataToModify.superficie,
              habitaciones: dataToModify.habitaciones,
              baños: dataToModify.baños,
              total_unidades: dataToModify.total_unidades,
              unidades_disponibles: dataToModify.unidades_disponibles,
              desarrollo_id: dataToModify.desarrollo_id,
              descripcion: dataToModify.descripcion,
              imagen_url: dataToModify.imagen_url
            });
        } else {
          result = await supabase
            .from('prototipos')
            .update({
              nombre: dataToModify.nombre,
              tipo: dataToModify.tipo,
              precio: dataToModify.precio,
              superficie: dataToModify.superficie,
              habitaciones: dataToModify.habitaciones,
              baños: dataToModify.baños,
              total_unidades: dataToModify.total_unidades,
              unidades_disponibles: dataToModify.unidades_disponibles,
              desarrollo_id: dataToModify.desarrollo_id,
              descripcion: dataToModify.descripcion,
              imagen_url: dataToModify.imagen_url
            })
            .eq('id', resourceId);
        }
      } else if (resourceType === 'desarrollos') {
        const desarrolloData = dataToSave as DesarrolloResource;
        if (!resourceId) {
          result = await supabase
            .from('desarrollos')
            .insert({
              nombre: desarrolloData.nombre,
              ubicacion: desarrolloData.ubicacion,
              total_unidades: desarrolloData.total_unidades,
              unidades_disponibles: desarrolloData.unidades_disponibles,
              avance_porcentaje: desarrolloData.avance_porcentaje,
              fecha_inicio: desarrolloData.fecha_inicio,
              fecha_entrega: desarrolloData.fecha_entrega,
              descripcion: desarrolloData.descripcion,
              imagen_url: desarrolloData.imagen_url,
              moneda: desarrolloData.moneda,
              comision_operador: desarrolloData.comision_operador,
              mantenimiento_valor: desarrolloData.mantenimiento_valor,
              es_mantenimiento_porcentaje: desarrolloData.es_mantenimiento_porcentaje,
              gastos_fijos: desarrolloData.gastos_fijos,
              es_gastos_fijos_porcentaje: desarrolloData.es_gastos_fijos_porcentaje,
              gastos_variables: desarrolloData.gastos_variables,
              es_gastos_variables_porcentaje: desarrolloData.es_gastos_variables_porcentaje,
              impuestos: desarrolloData.impuestos,
              es_impuestos_porcentaje: desarrolloData.es_impuestos_porcentaje,
              adr_base: desarrolloData.adr_base,
              ocupacion_anual: desarrolloData.ocupacion_anual
            });
        } else {
          result = await supabase
            .from('desarrollos')
            .update({
              nombre: desarrolloData.nombre,
              ubicacion: desarrolloData.ubicacion,
              total_unidades: desarrolloData.total_unidades,
              unidades_disponibles: desarrolloData.unidades_disponibles,
              avance_porcentaje: desarrolloData.avance_porcentaje,
              fecha_inicio: desarrolloData.fecha_inicio,
              fecha_entrega: desarrolloData.fecha_entrega,
              descripcion: desarrolloData.descripcion,
              imagen_url: desarrolloData.imagen_url,
              moneda: desarrolloData.moneda,
              comision_operador: desarrolloData.comision_operador,
              mantenimiento_valor: desarrolloData.mantenimiento_valor,
              es_mantenimiento_porcentaje: desarrolloData.es_mantenimiento_porcentaje,
              gastos_fijos: desarrolloData.gastos_fijos,
              es_gastos_fijos_porcentaje: desarrolloData.es_gastos_fijos_porcentaje,
              gastos_variables: desarrolloData.gastos_variables,
              es_gastos_variables_porcentaje: desarrolloData.es_gastos_variables_porcentaje,
              impuestos: desarrolloData.impuestos,
              es_impuestos_porcentaje: desarrolloData.es_impuestos_porcentaje,
              adr_base: desarrolloData.adr_base,
              ocupacion_anual: desarrolloData.ocupacion_anual
            })
            .eq('id', resourceId);
        }
      } else if (resourceType === 'leads') {
        const leadData = dataToSave as LeadResource;
        
        // Ensure the ultimo_contacto is set properly
        if (selectedDate && !leadData.ultimo_contacto) {
          leadData.ultimo_contacto = selectedDate.toISOString();
        }
        
        if (!resourceId) {
          result = await supabase
            .from('leads')
            .insert({
              nombre: leadData.nombre,
              email: leadData.email,
              telefono: leadData.telefono,
              interes_en: leadData.interes_en,
              origen: leadData.origen,
              estado: leadData.estado,
              subestado: leadData.subestado,
              agente: leadData.agente,
              notas: leadData.notas,
              ultimo_contacto: leadData.ultimo_contacto
            });
        } else {
          result = await supabase
            .from('leads')
            .update({
              nombre: leadData.nombre,
              email: leadData.email,
              telefono: leadData.telefono,
              interes_en: leadData.interes_en,
              origen: leadData.origen,
              estado: leadData.estado,
              subestado: leadData.subestado,
              agente: leadData.agente,
              notas: leadData.notas,
              ultimo_contacto: leadData.ultimo_contacto
            })
            .eq('id', resourceId);
        }
      } else if (resourceType === 'cotizaciones') {
        const cotizacionData = dataToSave as CotizacionResource;
        if (!resourceId) {
          result = await supabase
            .from('cotizaciones')
            .insert({
              lead_id: cotizacionData.lead_id,
              desarrollo_id: cotizacionData.desarrollo_id,
              prototipo_id: cotizacionData.prototipo_id,
              monto_anticipo: cotizacionData.monto_anticipo,
              numero_pagos: cotizacionData.numero_pagos,
              usar_finiquito: cotizacionData.usar_finiquito,
              monto_finiquito: cotizacionData.monto_finiquito,
              notas: cotizacionData.notas
            });
        } else {
          result = await supabase
            .from('cotizaciones')
            .update({
              lead_id: cotizacionData.lead_id,
              desarrollo_id: cotizacionData.desarrollo_id,
              prototipo_id: cotizacionData.prototipo_id,
              monto_anticipo: cotizacionData.monto_anticipo,
              numero_pagos: cotizacionData.numero_pagos,
              usar_finiquito: cotizacionData.usar_finiquito,
              monto_finiquito: cotizacionData.monto_finiquito,
              notas: cotizacionData.notas
            })
            .eq('id', resourceId);
        }
      }
      
      const { error } = result || { error: null };
      
      if (error) {
        console.error('Error saving resource:', error);
        toast({
          title: 'Error',
          description: `No se pudo guardar: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: resourceId 
            ? 'El recurso ha sido actualizado correctamente'
            : 'El recurso ha sido creado correctamente',
        });
        handleOpenChange(false);
        if (onSave) onSave();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error in saveResource:', error);
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error al guardar el recurso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTriggerButton = () => {
    if (open === undefined) {
      return (
        <Button onClick={() => setDialogOpen(true)}>
          {buttonText || 'Nuevo recurso'}
        </Button>
      );
    }
    return null;
  };

  const renderFormField = (field: any) => {
    if (resourceType === 'prototipos' && field.name === 'desarrollo_id' && desarrolloId) {
      return null;
    }
    
    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={field.name} className="text-right">
              {field.label}
            </Label>
            <div className="col-span-3">
              <Select 
                value={resource ? (resource as any)[field.name] || '' : ''}
                onValueChange={(value) => handleSelectChange(field.name, value)}
              >
                <SelectTrigger id={field.name} className="bg-white">
                  <SelectValue placeholder={`Seleccionar ${field.label}`} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {field.options.map((option: { value: string, label: string }) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'switch':
        return (
          <div key={field.name} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={field.name} className="text-right">
              {field.label}
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id={field.name}
                checked={resource ? (resource as any)[field.name] || false : false}
                onCheckedChange={(checked) => handleSwitchChange(field.name, checked)}
              />
            </div>
          </div>
        );
      case 'date':
        return (
          <div key={field.name} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={field.name} className="text-right">
              {field.label}
            </Label>
            <div className="col-span-3">
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
          </div>
        );
      case 'textarea':
        return (
          <div key={field.name} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={field.name} className="text-right">
              {field.label}
            </Label>
            <div className="col-span-3">
              <Input
                id={field.name}
                name={field.name}
                value={resource ? (resource as any)[field.name] || '' : ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
        );
      default:
        return (
          <div key={field.name} className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor={field.name} className="text-right">
              {field.label}
            </Label>
            <div className="col-span-3">
              <Input
                type={field.type}
                id={field.name}
                name={field.name}
                value={resource ? (resource as any)[field.name] || '' : ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderTriggerButton()}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{resourceId ? `Editar ${resourceType}` : `Crear nuevo ${resourceType}`}</DialogTitle>
            <DialogDescription>
              {resourceId ? 'Modifica los campos del recurso.' : 'Ingresa los datos del nuevo recurso.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {fields.filter(field => !(resourceType === 'prototipos' && field.name === 'desarrollo_id' && desarrolloId)).map(field => renderFormField(field))}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={() => resource && saveResource(resource)} disabled={isSubmitting || !resource}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;
