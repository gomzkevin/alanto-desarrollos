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
}

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
  desarrolloId
}: AdminResourceDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<FormValues | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(desarrolloId || null);
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  
  const { leads } = useLeads();
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
            nombre: ''
          } as LeadResource);
        } else if (resourceType === 'cotizaciones') {
          setResource({
            lead_id: '',
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
            { name: 'estado', label: 'Estado', type: 'text' },
            { name: 'origen', label: 'Origen', type: 'text' },
            { name: 'interes_en', label: 'Interés en', type: 'text' },
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
  }, [isOpen, resourceId, resourceType, toast, leads, desarrollos, prototipos, usarFiniquito, desarrolloId, selectedDesarrolloId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResource(prev => prev ? ({ ...prev, [name]: value }) as FormValues : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setResource(prev => {
      if (!prev) return null;
      const updated = { ...prev, [name]: value };
      return updated as FormValues;
    });
    
    if (name === 'desarrollo_id') {
      setSelectedDesarrolloId(value);
      setResource(prev => {
        if (!prev) return null;
        return { ...prev, prototipo_id: '' } as FormValues;
      });
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setResource(prev => {
      if (!prev) return null;
      const updated = { ...prev, [name]: checked };
      return updated as FormValues;
    });
    
    if (name === 'usar_finiquito') {
      setUsarFiniquito(checked);
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
            .insert(dataToModify);
        } else {
          result = await supabase
            .from('prototipos')
            .update(dataToModify)
            .eq('id', resourceId);
        }
      } else if (resourceType === 'desarrollos') {
        if (!resourceId) {
          const desarrolloData = dataToSave as DesarrolloResource;
          result = await supabase
            .from('desarrollos')
            .insert(desarrolloData);
        } else {
          result = await supabase
            .from('desarrollos')
            .update(dataToSave as DesarrolloResource)
            .eq('id', resourceId);
        }
      } else if (resourceType === 'leads') {
        if (!resourceId) {
          const leadData = dataToSave as LeadResource;
          result = await supabase
            .from('leads')
            .insert(leadData);
        } else {
          result = await supabase
            .from('leads')
            .update(dataToSave as LeadResource)
            .eq('id', resourceId);
        }
      } else if (resourceType === 'cotizaciones') {
        if (!resourceId) {
          const cotizacionData = dataToSave as CotizacionResource;
          result = await supabase
            .from('cotizaciones')
            .insert(cotizacionData);
        } else {
          result = await supabase
            .from('cotizaciones')
            .update(dataToSave as CotizacionResource)
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
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder={`Seleccionar ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
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
            <Button type="submit" onClick={() => saveResource(resource as FormValues)} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;

