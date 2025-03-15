
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminResourceDialogProps, FormValues, DesarrolloResource, PrototipoResource, LeadResource, CotizacionResource } from './types';
import DesarrolloForm from './DesarrolloForm';
import GenericForm from './GenericForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

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
  lead_id
}: AdminResourceDialogProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<FormValues | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const { toast } = useToast();
  
  const isOpen = open !== undefined ? open : dialogOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (onClose && !newOpen) {
      onClose();
    }
    setDialogOpen(newOpen);
  };

  // Handle amenities for desarrollo resources
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

  // Cargar datos iniciales
  useEffect(() => {
    const fetchResource = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      
      try {
        if (resourceId) {
          // Cargar recurso existente
          let query;
          
          if (resourceType === 'desarrollos') {
            query = supabase.from('desarrollos').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'prototipos') {
            query = supabase.from('prototipos').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'leads') {
            query = supabase.from('leads').select('*').eq('id', resourceId).single();
          } else if (resourceType === 'cotizaciones') {
            query = supabase.from('cotizaciones').select('*').eq('id', resourceId).single();
          }
          
          const { data, error } = await query;
          if (error) throw error;
          
          if (resourceType === 'desarrollos' && data.amenidades) {
            // Convertir amenidades si es necesario
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
          // Crear nuevo recurso con valores por defecto
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
          } else if (resourceType === 'prototipos' && desarrolloId) {
            setResource({
              desarrollo_id: desarrolloId,
              nombre: '',
              tipo: '',
              precio: 0,
              total_unidades: 0,
              unidades_disponibles: 0
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
            setResource({
              lead_id: lead_id || '',
              desarrollo_id: '',
              prototipo_id: '',
              monto_anticipo: 0,
              numero_pagos: 0,
              usar_finiquito: false
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
  }, [isOpen, resourceId, resourceType, desarrolloId, lead_id, toast]);

  // Guardar recurso
  const saveResource = async (formData: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (resourceId) {
        // Actualizar recurso existente
        if (resourceType === 'desarrollos') {
          const desarrolloData = formData as DesarrolloResource;
          // Asegurar que amenidades es un string JSON para guardar
          const dataToSave = { ...desarrolloData };
          
          // Convert amenidades to a JSON string if needed
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
        }
      } else {
        // Crear nuevo recurso
        if (resourceType === 'desarrollos') {
          const desarrolloData = formData as DesarrolloResource;
          // Asegurar que amenidades es un string JSON para guardar
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
                  fields={[]}
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
