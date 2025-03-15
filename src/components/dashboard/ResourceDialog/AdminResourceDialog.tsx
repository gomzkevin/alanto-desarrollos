
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, PlusCircle } from 'lucide-react';
import GenericForm from './GenericForm';
import { useToast } from '@/hooks/use-toast';
import { 
  AdminResourceDialogProps, 
  FieldDefinition, 
  FormValues, 
  ResourceType,
  DesarrolloResource,
  PrototipoResource,
  LeadResource,
  CotizacionResource,
  UnidadResource
} from './types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

const AdminResourceDialog = ({
  open,
  onClose,
  resourceType,
  resourceId,
  onSave,
  buttonText = 'Editar',
  buttonIcon,
  buttonVariant = 'outline',
  onSuccess,
  desarrolloId,
  lead_id,
  prototipo_id,
  defaultValues
}: AdminResourceDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<FormValues | null>(null);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Control de estado del diálogo
  const isOpen = open !== undefined ? open : dialogOpen;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  useEffect(() => {
    if (resourceType === 'prototipos') {
      setFields([
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: [
          { value: 'apartamento', label: 'Apartamento' },
          { value: 'casa', label: 'Casa' },
          { value: 'villa', label: 'Villa' },
          { value: 'lote', label: 'Lote' },
          { value: 'local', label: 'Local comercial' },
        ]},
        { name: 'precio', label: 'Precio', type: 'number' },
        { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
        { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
        { name: 'baños', label: 'Baños', type: 'number' },
        { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' },
        { name: 'total_unidades', label: 'Total de unidades', type: 'number' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      ]);
    } else if (resourceType === 'unidades') {
      setFields([
        { name: 'numero', label: 'Número', type: 'text' },
        { name: 'nivel', label: 'Nivel/Piso', type: 'text' },
        { name: 'estado', label: 'Estado', type: 'select', options: [
          { value: 'disponible', label: 'Disponible' },
          { value: 'apartado', label: 'Apartado' },
          { value: 'en_proceso', label: 'En proceso de venta' },
          { value: 'en_pagos', label: 'En pagos' },
          { value: 'vendido', label: 'Vendido' },
        ]},
        { name: 'precio_venta', label: 'Precio de venta', type: 'number' },
        { name: 'comprador_id', label: 'Comprador', type: 'select-lead' },
      ]);
    } else if (resourceType === 'leads') {
      setFields([
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'telefono', label: 'Teléfono', type: 'text' },
        { name: 'interes_en', label: 'Interés en', type: 'text' },
        { name: 'origen', label: 'Origen', type: 'select', options: [
          { value: 'web', label: 'Sitio Web' },
          { value: 'referido', label: 'Referido' },
          { value: 'redes_sociales', label: 'Redes Sociales' },
          { value: 'evento', label: 'Evento' },
          { value: 'otro', label: 'Otro' },
        ]},
        { name: 'estado', label: 'Estado', type: 'select', options: [
          { value: 'nuevo', label: 'Nuevo' },
          { value: 'en_contacto', label: 'En contacto' },
          { value: 'calificado', label: 'Calificado' },
          { value: 'en_negociacion', label: 'En negociación' },
          { value: 'ganado', label: 'Ganado' },
          { value: 'perdido', label: 'Perdido' },
        ]},
        { name: 'notas', label: 'Notas', type: 'textarea' },
      ]);
    } else if (resourceType === 'cotizaciones') {
      setFields([
        { name: 'lead_id', label: 'Cliente', type: 'select-lead' },
        { name: 'desarrollo_id', label: 'Desarrollo', type: 'select-desarrollo' },
        { name: 'prototipo_id', label: 'Prototipo', type: 'select-prototipo' },
        { name: 'monto_anticipo', label: 'Monto de anticipo', type: 'number' },
        { name: 'numero_pagos', label: 'Número de pagos', type: 'number' },
        { name: 'usar_finiquito', label: 'Usar finiquito', type: 'switch' },
        { name: 'monto_finiquito', label: 'Monto de finiquito', type: 'number' },
        { name: 'notas', label: 'Notas', type: 'textarea' },
      ]);
    }
  }, [resourceType]);

  useEffect(() => {
    if (resource && resourceType === 'desarrollos') {
      const desarrolloResource = resource as DesarrolloResource;
      if (desarrolloResource.amenidades) {
        try {
          if (typeof desarrolloResource.amenidades === 'string') {
            const parsedAmenities = JSON.parse(desarrolloResource.amenidades as string);
            setSelectedAmenities(parsedAmenities);
          } else if (Array.isArray(desarrolloResource.amenidades)) {
            setSelectedAmenities(desarrolloResource.amenidades as string[]);
          }
        } catch (error) {
          console.error('Error parsing amenidades:', error);
        }
      }
    }
  }, [resource, resourceType]);

  useEffect(() => {
    const fetchResource = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      
      try {
        if (resourceId) {
          let query;
          
          if (resourceType === 'desarrollos') {
            query = supabase.from('desarrollos');
          } else if (resourceType === 'prototipos') {
            query = supabase.from('prototipos');
          } else if (resourceType === 'leads') {
            query = supabase.from('leads');
          } else if (resourceType === 'cotizaciones') {
            query = supabase.from('cotizaciones');
          } else if (resourceType === 'unidades') {
            query = supabase.from('unidades');
          }
          
          const { data, error } = await query.select('*').eq('id', resourceId).single();
          
          if (error) throw error;
          
          if (resourceType === 'desarrollos' && data.amenidades) {
            try {
              if (typeof data.amenidades === 'string') {
                data.amenidades = JSON.parse(data.amenidades);
              }
            } catch (error) {
              console.error('Error parsing amenidades:', error);
              data.amenidades = [];
            }
          }
          
          setResource(data);
        } else {
          if (resourceType === 'desarrollos') {
            setResource({
              nombre: '',
              ubicacion: '',
              total_unidades: 0,
              unidades_disponibles: 0,
              avance_porcentaje: 0,
              descripcion: '',
              moneda: 'MXN',
              comision_operador: 15,
              mantenimiento_valor: 5,
              es_mantenimiento_porcentaje: true,
              gastos_fijos: 0,
              es_gastos_fijos_porcentaje: false,
              gastos_variables: 12,
              es_gastos_variables_porcentaje: true,
              impuestos: 35,
              es_impuestos_porcentaje: true,
              adr_base: 0,
              ocupacion_anual: 70
            });
          } else if (resourceType === 'prototipos') {
            setResource({
              nombre: '',
              desarrollo_id: desarrolloId || '',
              tipo: 'apartamento',
              precio: 0,
              superficie: 0,
              habitaciones: 0,
              baños: 0,
              estacionamientos: 0,
              total_unidades: 0,
              unidades_disponibles: 0
            });
          } else if (resourceType === 'leads') {
            setResource({
              nombre: '',
              email: '',
              telefono: '',
              interes_en: '',
              origen: 'web',
              estado: 'nuevo',
              subestado: 'sin_contactar'
            });
          } else if (resourceType === 'cotizaciones') {
            const initialValues = {
              lead_id: lead_id || '',
              desarrollo_id: desarrolloId || '',
              prototipo_id: prototipo_id || '',
              monto_anticipo: 0,
              numero_pagos: 0,
              usar_finiquito: false,
              ...(defaultValues || {})
            };
            setResource(initialValues);
          } else if (resourceType === 'unidades') {
            setResource({
              prototipo_id: prototipo_id || '',
              numero: '',
              estado: 'disponible'
            });
          }
        }
      } catch (error: any) {
        console.error(`Error fetching ${resourceType}:`, error);
        toast({
          title: 'Error',
          description: `No se pudo cargar el recurso: ${error.message}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResource();
  }, [isOpen, resourceId, resourceType, desarrolloId, lead_id, prototipo_id, defaultValues, toast]);

  const saveResource = async (formData: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (resourceId) {
        if (resourceType === 'desarrollos') {
          const desarrolloData = formData as DesarrolloResource;
          const dataToSave = { ...desarrolloData };
          
          if (selectedAmenities.length > 0) {
            dataToSave.amenidades = selectedAmenities as unknown as Json;
          }
          
          response = await supabase
            .from('desarrollos')
            .update(dataToSave)
            .eq('id', resourceId)
            .select();
        } else if (resourceType === 'prototipos') {
          const prototipoData = formData as PrototipoResource;
          response = await supabase
            .from('prototipos')
            .update(prototipoData)
            .eq('id', resourceId)
            .select();
        } else if (resourceType === 'leads') {
          const leadData = formData as LeadResource;
          response = await supabase
            .from('leads')
            .update(leadData)
            .eq('id', resourceId)
            .select();
        } else if (resourceType === 'cotizaciones') {
          const cotizacionData = formData as CotizacionResource;
          response = await supabase
            .from('cotizaciones')
            .update(cotizacionData)
            .eq('id', resourceId)
            .select();
        } else if (resourceType === 'unidades') {
          const unidadData = formData as UnidadResource;
          response = await supabase
            .from('unidades')
            .update(unidadData)
            .eq('id', resourceId)
            .select();
        }
      } else {
        if (resourceType === 'desarrollos') {
          const desarrolloData = formData as DesarrolloResource;
          const dataToSave = { ...desarrolloData };
          
          const amenidadesJson = JSON.stringify(selectedAmenities) as unknown as Json;
          dataToSave.amenidades = selectedAmenities.length > 0 ? amenidadesJson : null;
          
          response = await supabase
            .from('desarrollos')
            .insert(dataToSave)
            .select();
        } else if (resourceType === 'prototipos') {
          const prototipoData = formData as PrototipoResource;
          response = await supabase
            .from('prototipos')
            .insert({
              ...prototipoData,
              // Si se crea un nuevo prototipo, las unidades disponibles son iguales al total
              unidades_disponibles: prototipoData.total_unidades || 0
            })
            .select();
        } else if (resourceType === 'leads') {
          const leadData = formData as LeadResource;
          response = await supabase
            .from('leads')
            .insert(leadData)
            .select();
        } else if (resourceType === 'cotizaciones') {
          const cotizacionData = formData as CotizacionResource;
          response = await supabase
            .from('cotizaciones')
            .insert(cotizacionData)
            .select();
        } else if (resourceType === 'unidades') {
          const unidadData = formData as UnidadResource;
          response = await supabase
            .from('unidades')
            .insert(unidadData)
            .select();
        }
      }
      
      if (response?.error) {
        throw response.error;
      }
      
      toast({
        title: 'Éxito',
        description: `${resourceType} ${resourceId ? 'actualizado' : 'creado'} correctamente`,
      });
      
      if (onSave) {
        onSave();
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleOpenChange(false);
    } catch (error: any) {
      console.error(`Error saving ${resourceType}:`, error);
      toast({
        title: 'Error',
        description: `No se pudo guardar: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!resource) return;
    
    const { name, value, type } = e.target;
    
    let updatedValue: any = value;
    
    if (type === 'number') {
      updatedValue = value === '' ? '' : Number(value);
    }
    
    setResource({
      ...resource,
      [name]: updatedValue
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!resource) return;
    
    setResource({
      ...resource,
      [name]: value
    });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    if (!resource) return;
    
    setResource({
      ...resource,
      [name]: checked
    });
  };
  
  const handleLeadSelect = (leadId: string, leadName: string) => {
    if (!resource) return;
    
    // Para unidades, guardar tanto el ID como el nombre del comprador
    if (resourceType === 'unidades') {
      setResource({
        ...resource,
        comprador_id: leadId,
        comprador_nombre: leadName
      } as UnidadResource);
    } else {
      // Para otros recursos, solo guardar el ID
      setResource({
        ...resource,
        lead_id: leadId
      });
    }
  };
  
  const handleAmenitiesChange = (amenities: string[]) => {
    setSelectedAmenities(amenities);
  };
  
  return (
    <>
      {/* Botón para abrir el diálogo si no se proporciona 'open' */}
      {open === undefined && (
        <Button
          variant={buttonVariant as any}
          size="sm"
          onClick={() => handleOpenChange(true)}
        >
          {buttonIcon || <PlusCircle className="h-4 w-4 mr-2" />}
          {buttonText}
        </Button>
      )}
      
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {resourceId ? `Editar ${resourceType}` : `Nuevo ${resourceType}`}
            </DialogTitle>
            <DialogDescription>
              {resourceId 
                ? `Actualiza la información de este ${resourceType}` 
                : `Completa el formulario para crear un nuevo ${resourceType}`}
            </DialogDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              <GenericForm
                fields={fields}
                resource={resource}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                handleSwitchChange={handleSwitchChange}
                resourceType={resourceType}
                resourceId={resourceId}
                handleAmenitiesChange={handleAmenitiesChange}
                selectedAmenities={selectedAmenities}
                desarrolloId={desarrolloId}
                prototipo_id={prototipo_id}
                lead_id={lead_id}
                handleLeadSelect={handleLeadSelect}
              />
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => resource && saveResource(resource)}
                  disabled={isSubmitting || !resource}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;
