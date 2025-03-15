import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminResourceDialogProps, FormValues, DesarrolloResource, PrototipoResource, LeadResource, CotizacionResource, UnidadResource, FieldDefinition } from './types';
import DesarrolloForm from './DesarrolloForm';
import GenericForm from './GenericForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import usePrototipos from '@/hooks/usePrototipos';
import useLeads from '@/hooks/useLeads';

const TIPO_PROTOTIPO_OPTIONS = [
  { value: 'departamento', label: 'Departamento' },
  { value: 'loft', label: 'Loft' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'casa', label: 'Casa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'local', label: 'Local Comercial' },
  { value: 'oficina', label: 'Oficina' }
];

const ESTADO_UNIDAD_OPTIONS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'apartado', label: 'Apartado' },
  { value: 'en_proceso', label: 'En proceso de venta' },
  { value: 'en_pagos', label: 'En plan de pagos' },
  { value: 'vendido', label: 'Vendido' }
];

const AdminResourceDialog = ({ 
  open, 
  onClose, 
  resourceType, 
  resourceId, 
  onSave,
  buttonText,
  buttonIcon,
  buttonVariant = 'default',
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
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const { toast } = useToast();
  const { prototipos } = usePrototipos({});
  const { leads } = useLeads({});
  
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
        { name: 'nombre', label: 'Nombre', type: 'text', tab: 'General' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: TIPO_PROTOTIPO_OPTIONS, tab: 'General' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea', tab: 'General' },
        { name: 'precio', label: 'Precio', type: 'number', tab: 'General' },
        { name: 'superficie', label: 'Superficie (m²)', type: 'number', tab: 'Características' },
        { name: 'habitaciones', label: 'Habitaciones', type: 'number', tab: 'Características' },
        { name: 'baños', label: 'Baños', type: 'number', tab: 'Características' },
        { name: 'estacionamientos', label: 'Cajones de estacionamiento', type: 'number', tab: 'Características' },
        { name: 'total_unidades', label: 'Total unidades', type: 'number', tab: 'Inventario' },
        { name: 'unidades_disponibles', label: 'Unidades disponibles', type: 'number', tab: 'Inventario' },
        { name: 'imagen_url', label: 'URL de imagen', type: 'text', tab: 'Media' },
        { name: 'desarrollo_id', label: 'Desarrollo', type: 'select-desarrollo', tab: 'General' },
      ]);
    } else if (resourceType === 'cotizaciones') {
      setFields([
        { name: 'lead_id', label: 'Cliente', type: 'select-lead' },
        { name: 'desarrollo_id', label: 'Desarrollo', type: 'select-desarrollo' },
        { name: 'prototipo_id', label: 'Prototipo', type: 'select-prototipo' },
        { name: 'monto_anticipo', label: 'Monto de anticipo', type: 'number' },
        { name: 'numero_pagos', label: 'Número de pagos', type: 'number' },
        { name: 'usar_finiquito', label: 'Incluir finiquito', type: 'switch' },
        { name: 'monto_finiquito', label: 'Monto de finiquito', type: 'number' },
        { name: 'notas', label: 'Notas', type: 'textarea' },
      ]);
    } else if (resourceType === 'unidades') {
      setFields([
        { name: 'numero', label: 'Número/Identificador', type: 'text' },
        { name: 'nivel', label: 'Nivel/Piso', type: 'text' },
        { name: 'estado', label: 'Estado', type: 'select', options: ESTADO_UNIDAD_OPTIONS },
        { name: 'precio_venta', label: 'Precio de venta', type: 'number' },
        { name: 'comprador_id', label: 'Comprador', type: 'select-lead' },
        { name: 'comprador_nombre', label: 'Nombre del comprador', type: 'text' },
      ]);
    } else if (resourceType === 'leads') {
      setFields([
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'telefono', label: 'Teléfono', type: 'text' },
        { name: 'origen', label: 'Origen', type: 'text' },
        { name: 'interes_en', label: 'Interesado en', type: 'text' },
        { name: 'estado', label: 'Estado', type: 'text' },
        { name: 'subestado', label: 'Subestado', type: 'text' },
        { name: 'agente', label: 'Agente asignado', type: 'text' },
        { name: 'notas', label: 'Notas', type: 'textarea' },
      ]);
    }
  }, [resourceType]);

  useEffect(() => {
    if (resource && resourceType === 'desarrollos') {
      const desarrolloResource = resource as DesarrolloResource;
      if (desarrolloResource.amenidades) {
        const amenities = Array.isArray(desarrolloResource.amenidades) 
          ? desarrolloResource.amenidades 
          : [];
        setSelectedAmenities(amenities);
      } else {
        setSelectedAmenities([]);
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
            query = supabase.from('desarrollos').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'prototipos') {
            query = supabase.from('prototipos').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'leads') {
            query = supabase.from('leads').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'cotizaciones') {
            query = supabase.from('cotizaciones').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'unidades') {
            query = supabase.from('unidades').select('*').eq('id', resourceId).single();
          }
          
          const { data, error } = await query;
          if (error) throw error;
          
          if (resourceType === 'desarrollos' && data.amenidades) {
            try {
              if (typeof data.amenidades === 'string') {
                data.amenidades = JSON.parse(data.amenidades);
              }
              setSelectedAmenities(Array.isArray(data.amenidades) ? data.amenidades : []);
            } catch (e) {
              console.error('Error parsing amenidades:', e);
              data.amenidades = [];
              setSelectedAmenities([]);
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
              amenidades: [],
              moneda: 'MXN'
            });
            setSelectedAmenities([]);
          } else if (resourceType === 'prototipos') {
            setResource({
              nombre: '',
              tipo: '',
              precio: 0,
              total_unidades: 0,
              unidades_disponibles: 0,
              superficie: 0,
              habitaciones: 0,
              baños: 0,
              estacionamientos: 0,
              descripcion: '',
              desarrollo_id: desarrolloId || '',
            });
          } else if (resourceType === 'leads') {
            setResource({
              nombre: '',
              email: '',
              telefono: '',
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
      } catch (error) {
        console.error('Error al cargar el recurso:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la información del recurso',
          variant: 'destructive'
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
            dataToSave.amenidades = selectedAmenities as any;
          }
          
          const amenidadesJson = JSON.stringify(selectedAmenities) as Json;
          
          response = await supabase
            .from('desarrollos')
            .update({
              nombre: dataToSave.nombre,
              ubicacion: dataToSave.ubicacion,
              total_unidades: dataToSave.total_unidades,
              unidades_disponibles: dataToSave.unidades_disponibles,
              avance_porcentaje: dataToSave.avance_porcentaje,
              fecha_inicio: dataToSave.fecha_inicio,
              fecha_entrega: dataToSave.fecha_entrega,
              descripcion: dataToSave.descripcion,
              imagen_url: dataToSave.imagen_url,
              moneda: dataToSave.moneda,
              comision_operador: dataToSave.comision_operador,
              mantenimiento_valor: dataToSave.mantenimiento_valor,
              es_mantenimiento_porcentaje: dataToSave.es_mantenimiento_porcentaje,
              gastos_fijos: dataToSave.gastos_fijos,
              es_gastos_fijos_porcentaje: dataToSave.es_gastos_fijos_porcentaje,
              gastos_variables: dataToSave.gastos_variables,
              es_gastos_variables_porcentaje: dataToSave.es_gastos_variables_porcentaje,
              impuestos: dataToSave.impuestos,
              es_impuestos_porcentaje: dataToSave.es_impuestos_porcentaje,
              adr_base: dataToSave.adr_base,
              ocupacion_anual: dataToSave.ocupacion_anual,
              amenidades: amenidadesJson
            })
            .eq('id', resourceId);
        } else if (resourceType === 'prototipos') {
          const prototipoData = formData as PrototipoResource;
          response = await supabase
            .from('prototipos')
            .update({
              nombre: prototipoData.nombre,
              tipo: prototipoData.tipo,
              precio: prototipoData.precio,
              superficie: prototipoData.superficie,
              habitaciones: prototipoData.habitaciones,
              baños: prototipoData.baños,
              estacionamientos: prototipoData.estacionamientos,
              total_unidades: prototipoData.total_unidades,
              unidades_disponibles: prototipoData.unidades_disponibles,
              descripcion: prototipoData.descripcion,
              imagen_url: prototipoData.imagen_url,
              desarrollo_id: prototipoData.desarrollo_id,
            })
            .eq('id', resourceId);
        } else if (resourceType === 'leads') {
          const leadData = formData as LeadResource;
          response = await supabase
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
            })
            .eq('id', resourceId);
        } else if (resourceType === 'cotizaciones') {
          const cotizacionData = formData as CotizacionResource;
          response = await supabase
            .from('cotizaciones')
            .update({
              lead_id: cotizacionData.lead_id,
              desarrollo_id: cotizacionData.desarrollo_id,
              prototipo_id: cotizacionData.prototipo_id,
              monto_anticipo: cotizacionData.monto_anticipo,
              numero_pagos: cotizacionData.numero_pagos,
              usar_finiquito: cotizacionData.usar_finiquito,
              monto_finiquito: cotizacionData.monto_finiquito,
              notas: cotizacionData.notas,
            })
            .eq('id', resourceId);
        } else if (resourceType === 'unidades') {
          const unidadData = formData as UnidadResource;
          response = await supabase
            .from('unidades')
            .update({
              numero: unidadData.numero,
              nivel: unidadData.nivel,
              estado: unidadData.estado,
              comprador_id: unidadData.comprador_id,
              comprador_nombre: unidadData.comprador_nombre,
              precio_venta: unidadData.precio_venta
            })
            .eq('id', resourceId);
        }
      } else {
        if (resourceType === 'desarrollos') {
          const desarrolloData = formData as DesarrolloResource;
          const dataToSave = { ...desarrolloData };
          
          const amenidadesJson = JSON.stringify(selectedAmenities) as Json;
          
          response = await supabase
            .from('desarrollos')
            .insert({
              nombre: dataToSave.nombre,
              ubicacion: dataToSave.ubicacion,
              total_unidades: dataToSave.total_unidades,
              unidades_disponibles: dataToSave.unidades_disponibles,
              avance_porcentaje: dataToSave.avance_porcentaje,
              fecha_inicio: dataToSave.fecha_inicio,
              fecha_entrega: dataToSave.fecha_entrega,
              descripcion: dataToSave.descripcion,
              imagen_url: dataToSave.imagen_url,
              moneda: dataToSave.moneda,
              comision_operador: dataToSave.comision_operador,
              mantenimiento_valor: dataToSave.mantenimiento_valor,
              es_mantenimiento_porcentaje: dataToSave.es_mantenimiento_porcentaje,
              gastos_fijos: dataToSave.gastos_fijos,
              es_gastos_fijos_porcentaje: dataToSave.es_gastos_fijos_porcentaje,
              gastos_variables: dataToSave.gastos_variables,
              es_gastos_variables_porcentaje: dataToSave.es_gastos_variables_porcentaje,
              impuestos: dataToSave.impuestos,
              es_impuestos_porcentaje: dataToSave.es_impuestos_porcentaje,
              adr_base: dataToSave.adr_base,
              ocupacion_anual: dataToSave.ocupacion_anual,
              amenidades: amenidadesJson
            });
        } else if (resourceType === 'prototipos') {
          const prototipoData = formData as PrototipoResource;
          response = await supabase.from('prototipos').insert({
            nombre: prototipoData.nombre,
            tipo: prototipoData.tipo,
            precio: prototipoData.precio,
            superficie: prototipoData.superficie,
            habitaciones: prototipoData.habitaciones,
            baños: prototipoData.baños,
            estacionamientos: prototipoData.estacionamientos,
            total_unidades: prototipoData.total_unidades,
            unidades_disponibles: prototipoData.unidades_disponibles,
            descripcion: prototipoData.descripcion,
            imagen_url: prototipoData.imagen_url,
            desarrollo_id: prototipoData.desarrollo_id,
          });
        } else if (resourceType === 'leads') {
          const leadData = formData as LeadResource;
          response = await supabase.from('leads').insert({
            nombre: leadData.nombre,
            email: leadData.email,
            telefono: leadData.telefono,
            interes_en: leadData.interes_en,
            origen: leadData.origen,
            estado: leadData.estado,
            subestado: leadData.subestado,
            agente: leadData.agente,
            notas: leadData.notas,
          });
        } else if (resourceType === 'cotizaciones') {
          const cotizacionData = formData as CotizacionResource;
          response = await supabase.from('cotizaciones').insert({
            lead_id: cotizacionData.lead_id,
            desarrollo_id: cotizacionData.desarrollo_id,
            prototipo_id: cotizacionData.prototipo_id,
            monto_anticipo: cotizacionData.monto_anticipo,
            numero_pagos: cotizacionData.numero_pagos,
            usar_finiquito: cotizacionData.usar_finiquito,
            monto_finiquito: cotizacionData.monto_finiquito,
            notas: cotizacionData.notas,
          });
        } else if (resourceType === 'unidades') {
          const unidadData = formData as UnidadResource;
          response = await supabase.from('unidades').insert({
            prototipo_id: unidadData.prototipo_id || prototipo_id,
            numero: unidadData.numero,
            nivel: unidadData.nivel,
            estado: unidadData.estado,
            comprador_id: unidadData.comprador_id,
            comprador_nombre: unidadData.comprador_nombre,
            precio_venta: unidadData.precio_venta
          });
        }
      }
      
      if (response?.error) throw response.error;
      
      toast({
        title: 'Éxito',
        description: resourceId ? 'Recurso actualizado correctamente' : 'Recurso creado correctamente',
      });
      
      if (onSave) onSave();
      if (onSuccess) onSuccess();
      
      handleOpenChange(false);
    } catch (error: any) {
      console.error('Error al guardar el recurso:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el recurso',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmenitiesChange = (amenities: string[]) => {
    setSelectedAmenities(amenities);
    
    if (resource && resourceType === 'desarrollos') {
      const updatedResource = { ...resource as DesarrolloResource, amenidades: amenities };
      setResource(updatedResource);
    }
  };

  const renderTriggerButton = () => {
    if (open === undefined) {
      return (
        <Button onClick={() => setDialogOpen(true)} variant={buttonVariant as any}>
          {buttonIcon}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {resourceId ? `Editar ${resourceType}` : `Crear nuevo ${resourceType}`}
            </DialogTitle>
            <DialogDescription>
              {resourceId ? 'Modifica los campos del recurso.' : 'Ingresa los datos del nuevo recurso.'}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {resourceType === 'desarrollos' ? (
                <DesarrolloForm
                  resource={resource as DesarrolloResource}
                  setResource={(value) => setResource(value as FormValues)}
                  resourceId={resourceId}
                  selectedAmenities={selectedAmenities}
                  onAmenitiesChange={handleAmenitiesChange}
                />
              ) : (
                <GenericForm
                  fields={fields}
                  resource={resource}
                  handleChange={(e) => {
                    if (!resource) return;
                    
                    const { name, value, type } = e.target;
                    
                    if (type === 'number') {
                      setResource({ ...resource, [name]: value === '' ? '' : Number(value) });
                    } else {
                      setResource({ ...resource, [name]: value });
                    }
                  }}
                  handleSelectChange={(name, value) => {
                    if (!resource) return;
                    setResource({ ...resource, [name]: value });
                  }}
                  handleSwitchChange={(name, checked) => {
                    if (!resource) return;
                    setResource({ ...resource, [name]: checked });
                  }}
                  resourceType={resourceType}
                  resourceId={resourceId}
                  desarrolloId={desarrolloId}
                  prototipo_id={prototipo_id}
                />
              )}
            </>
          )}

          <DialogFooter className="mt-6 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              onClick={() => resource && saveResource(resource)} 
              disabled={isSubmitting || !resource}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminResourceDialog;
