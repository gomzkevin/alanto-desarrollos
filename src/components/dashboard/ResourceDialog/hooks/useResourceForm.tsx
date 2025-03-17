import { useState, useEffect } from 'react';
import { FormValues, ResourceType } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface UseResourceFormProps {
  resourceType: ResourceType;
  resourceId?: string;
  desarrolloId?: string;
  lead_id?: string;
  prototipo_id?: string;
  defaultValues?: Record<string, any>;
  onSuccess?: () => void;
  onSave?: () => void;
}

export function useResourceForm({
  resourceType,
  resourceId,
  desarrolloId,
  lead_id,
  prototipo_id,
  defaultValues,
  onSuccess,
  onSave
}: UseResourceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resource, setResource] = useState<FormValues | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResource = async () => {
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
  }, [resourceId, resourceType, desarrolloId, lead_id, prototipo_id, defaultValues, toast]);

  useEffect(() => {
    if (resource && resourceType === 'desarrollos') {
      const desarrolloResource = resource as any;
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
    
    if (resourceType === 'unidades') {
      setResource({
        ...resource,
        comprador_id: leadId,
        comprador_nombre: leadName
      } as any);
    } else {
      setResource({
        ...resource,
        lead_id: leadId
      });
    }
  };
  
  const handleAmenitiesChange = (amenities: string[]) => {
    setSelectedAmenities(amenities);
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!resource) return;
    
    const formattedDate = date ? date.toISOString().split('T')[0] : null; // Format as YYYY-MM-DD
    
    setResource({
      ...resource,
      [name]: formattedDate
    });
  };

  const saveResource = async (formData: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (resourceType === 'cotizaciones') {
        const cotizacionData = formData as any;
        
        if (!cotizacionData.lead_id) {
          throw new Error('Debe seleccionar un cliente');
        }
        
        if (!cotizacionData.desarrollo_id) {
          throw new Error('Debe seleccionar un desarrollo');
        }
        
        if (!cotizacionData.prototipo_id) {
          throw new Error('Debe seleccionar un prototipo');
        }
        
        if (cotizacionData.lead_id && cotizacionData.desarrollo_id && cotizacionData.prototipo_id) {
          response = await supabase
            .from('cotizaciones')
            .insert(cotizacionData)
            .select();
        } else {
          throw new Error('Todos los campos obligatorios deben tener un valor válido');
        }
      }
      
      if (resourceId) {
        if (resourceType === 'desarrollos') {
          const desarrolloData = formData as any;
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
          const prototipoData = formData as any;
          response = await supabase
            .from('prototipos')
            .update(prototipoData)
            .eq('id', resourceId)
            .select();
        } else if (resourceType === 'leads') {
          const leadData = formData as any;
          response = await supabase
            .from('leads')
            .update(leadData)
            .eq('id', resourceId)
            .select();
        } else if (resourceType === 'cotizaciones') {
          const cotizacionData = formData as any;
          response = await supabase
            .from('cotizaciones')
            .update(cotizacionData)
            .eq('id', resourceId)
            .select();
        } else if (resourceType === 'unidades') {
          const unidadData = formData as any;
          response = await supabase
            .from('unidades')
            .update(unidadData)
            .eq('id', resourceId)
            .select();
        }
      } else {
        if (resourceType === 'desarrollos') {
          const desarrolloData = formData as any;
          const dataToSave = { ...desarrolloData };
          
          const amenidadesJson = JSON.stringify(selectedAmenities) as unknown as Json;
          dataToSave.amenidades = selectedAmenities.length > 0 ? amenidadesJson : null;
          
          response = await supabase
            .from('desarrollos')
            .insert(dataToSave)
            .select();
        } else if (resourceType === 'prototipos') {
          const prototipoData = formData as any;
          response = await supabase
            .from('prototipos')
            .insert({
              ...prototipoData,
              unidades_disponibles: prototipoData.total_unidades || 0
            })
            .select();
        } else if (resourceType === 'leads') {
          const leadData = formData as any;
          response = await supabase
            .from('leads')
            .insert(leadData)
            .select();
        } else if (resourceType === 'cotizaciones') {
          const cotizacionData = formData as any;
          response = await supabase
            .from('cotizaciones')
            .insert(cotizacionData)
            .select();
        } else if (resourceType === 'unidades') {
          const unidadData = formData as any;
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
      
      return true;
    } catch (error: any) {
      console.error(`Error saving ${resourceType}:`, error);
      toast({
        title: 'Error',
        description: `No se pudo guardar: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    isSubmitting,
    resource,
    selectedAmenities,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleLeadSelect,
    handleAmenitiesChange,
    saveResource,
    setResource,
    handleDateChange
  };
}
