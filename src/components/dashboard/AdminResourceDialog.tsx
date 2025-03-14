
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type ResourceType = 'desarrollos' | 'prototipos' | 'leads' | 'cotizaciones';

interface AdminResourceDialogProps {
  open: boolean;
  onClose: () => void;
  resourceType: ResourceType;
  resourceId?: string;
  onSave?: () => void;
  buttonText?: string;
  onSuccess?: () => void;
}

// Define a type for the form values based on the resource type
type FormValues =
  | Tables<'desarrollos'>
  | Tables<'prototipos'>
  | Tables<'leads'>
  | Tables<'cotizaciones'>
  | Record<string, any>;

const AdminResourceDialog: React.FC<AdminResourceDialogProps> = ({ 
  open, 
  onClose, 
  resourceType, 
  resourceId, 
  onSave,
  buttonText,
  onSuccess 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<FormValues | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handle open state based on prop or controlled state
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
        try {
          let query;
          
          // TypeScript-safe way to fetch resource by type
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
            setResource(data);
          }
        } catch (error) {
          console.error('Error in fetchResource:', error);
          toast({
            title: 'Error',
            description: 'Ha ocurrido un error al cargar el recurso',
            variant: 'destructive',
          });
        }
      } else {
        setResource({});
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
            { name: 'desarrollo_id', label: 'Desarrollo ID', type: 'text' },
            { name: 'tipo', label: 'Tipo', type: 'text' },
            { name: 'precio', label: 'Precio', type: 'number' },
            { name: 'superficie', label: 'Superficie', type: 'number' },
            { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
            { name: 'baños', label: 'Baños', type: 'number' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' },
            { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number' },
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
              { name: 'lead_id', label: 'Lead ID', type: 'text' },
              { name: 'desarrollo_id', label: 'Desarrollo ID', type: 'text' },
              { name: 'prototipo_id', label: 'Prototipo ID', type: 'text' },
              { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number' },
              { name: 'numero_pagos', label: 'Número de Pagos', type: 'number' },
              { name: 'usar_finiquito', label: 'Usar Finiquito', type: 'switch' },
              { name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number' },
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
  }, [isOpen, resourceId, resourceType, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResource(prev => prev ? ({ ...prev, [name]: value }) : { [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setResource(prev => prev ? ({ ...prev, [name]: checked }) : { [name]: checked });
  };

  const saveResource = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let result;
      
      // Handle creation of new resource
      if (!resourceId) {
        if (resourceType === 'desarrollos') {
          result = await supabase
            .from('desarrollos')
            .insert(values as Tables<'desarrollos'>);
        } else if (resourceType === 'prototipos') {
          result = await supabase
            .from('prototipos')
            .insert(values as Tables<'prototipos'>);
        } else if (resourceType === 'leads') {
          result = await supabase
            .from('leads')
            .insert(values as Tables<'leads'>);
        } else if (resourceType === 'cotizaciones') {
          result = await supabase
            .from('cotizaciones')
            .insert(values as Tables<'cotizaciones'>);
        }
      } else {
        // Handle updating existing resource
        if (resourceType === 'desarrollos') {
          result = await supabase
            .from('desarrollos')
            .update(values as Tables<'desarrollos'>)
            .eq('id', resourceId);
        } else if (resourceType === 'prototipos') {
          result = await supabase
            .from('prototipos')
            .update(values as Tables<'prototipos'>)
            .eq('id', resourceId);
        } else if (resourceType === 'leads') {
          result = await supabase
            .from('leads')
            .update(values as Tables<'leads'>)
            .eq('id', resourceId);
        } else if (resourceType === 'cotizaciones') {
          result = await supabase
            .from('cotizaciones')
            .update(values as Tables<'cotizaciones'>)
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

  // If the component is used with a button
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
            {fields.map(field => (
              <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={field.name} className="text-right">
                  {field.label}
                </Label>
                <div className="col-span-3">
                  {field.type === 'textarea' ? (
                    <Input
                      id={field.name}
                      name={field.name}
                      value={resource ? (resource as any)[field.name] || '' : ''}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  ) : field.type === 'switch' ? (
                    <Switch
                      id={field.name}
                      checked={resource ? (resource as any)[field.name] || false : false}
                      onCheckedChange={(checked) => handleSwitchChange(field.name, checked)}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={resource ? (resource as any)[field.name] || '' : ''}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                  )}
                </div>
              </div>
            ))}
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
