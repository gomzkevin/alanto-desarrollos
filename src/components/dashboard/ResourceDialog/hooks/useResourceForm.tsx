import { useState, useEffect, useCallback } from 'react';
import { FormValues, ResourceType } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import useUnidades from '@/hooks/useUnidades';

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
  const { countUnidadesByStatus } = useUnidades();
  
  const [isResourceFetched, setIsResourceFetched] = useState(false);

  const fetchResource = useCallback(async () => {
    if (isResourceFetched) return;
    
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

        if (resourceType === 'prototipos') {
          try {
            const counts = await countUnidadesByStatus(resourceId);
            data.unidades_vendidas = counts.vendidas;
            data.unidades_con_anticipo = counts.con_anticipo;
            data.unidades_disponibles = counts.disponibles;
          } catch (error) {
            console.error('Error getting unit counts:', error);
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
            unidades_disponibles: 0,
            unidades_vendidas: 0,
            unidades_con_anticipo: 0
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
            estado: 'disponible',
            comprador_id: '',
            comprador_nombre: ''
          });
        }
      }
      
      setIsResourceFetched(true);
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
  }, [
    resourceId, 
    resourceType, 
    desarrolloId, 
    lead_id, 
    prototipo_id, 
    defaultValues, 
    toast, 
    countUnidadesByStatus,
    isResourceFetched
  ]);

  useEffect(() => {
    fetchResource();
  }, [fetchResource]);

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

  useEffect(() => {
    setIsResourceFetched(false);
  }, [resourceId, resourceType]);

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
          
          if (resourceId) {
            const currentData = await supabase
              .from('prototipos')
              .select('unidades_vendidas, unidades_con_anticipo, unidades_disponibles')
              .eq('id', resourceId)
              .single();
              
            if (!currentData.error) {
              prototipoData.unidades_vendidas = currentData.data.unidades_vendidas;
              prototipoData.unidades_con_anticipo = currentData.data.unidades_con_anticipo;
              prototipoData.unidades_disponibles = currentData.data.unidades_disponibles;
            }
          }
          
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
              unidades_vendidas: prototipoData.unidades_vendidas,
              unidades_con_anticipo: prototipoData.unidades_con_anticipo,
              desarrollo_id: prototipoData.desarrollo_id,
              descripcion: prototipoData.descripcion,
              imagen_url: prototipoData.imagen_url
            })
            .eq('id', resourceId);
            
          if (!response.error) {
            await updatePrototipoUnidades(resourceId);
          }
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
            
          if (unidadData.prototipo_id) {
            await updatePrototipoUnidades(unidadData.prototipo_id);
          }
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
          
          const total = Number(prototipoData.total_unidades) || 0;
          const vendidas = Number(prototipoData.unidades_vendidas) || 0;
          const anticipos = Number(prototipoData.unidades_con_anticipo) || 0;
          prototipoData.unidades_disponibles = total - vendidas - anticipos;
          
          response = await supabase
            .from('prototipos')
            .insert(prototipoData)
            .select();
            
          if (prototipoData.desarrollo_id) {
            await updateDesarrolloUnidades(prototipoData.desarrollo_id);
          }
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
            
          if (unidadData.prototipo_id) {
            await updatePrototipoUnidades(unidadData.prototipo_id);
          }
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
  
  const updatePrototipoUnidades = async (prototipoId: string) => {
    try {
      const counts = await countUnidadesByStatus(prototipoId);
      
      await supabase
        .from('prototipos')
        .update({
          unidades_disponibles: counts.disponibles,
          unidades_vendidas: counts.vendidas,
          unidades_con_anticipo: counts.con_anticipo
        })
        .eq('id', prototipoId);
        
      const { data: prototipo } = await supabase
        .from('prototipos')
        .select('desarrollo_id')
        .eq('id', prototipoId)
        .single();
        
      if (prototipo && prototipo.desarrollo_id) {
        await updateDesarrolloUnidades(prototipo.desarrollo_id);
      }
    } catch (error) {
      console.error('Error updating prototipo units:', error);
    }
  };
  
  const updateDesarrolloUnidades = async (desarrolloId: string) => {
    try {
      const { data: prototipos } = await supabase
        .from('prototipos')
        .select('id, total_unidades, unidades_disponibles')
        .eq('desarrollo_id', desarrolloId);
        
      if (!prototipos) return;
      
      const totalUnidades = prototipos.reduce((sum, p) => sum + (p.total_unidades || 0), 0);
      const unidadesDisponibles = prototipos.reduce((sum, p) => sum + (p.unidades_disponibles || 0), 0);
      
      await supabase
        .from('desarrollos')
        .update({
          total_unidades: totalUnidades,
          unidades_disponibles: unidadesDisponibles
        })
        .eq('id', desarrolloId);
    } catch (error) {
      console.error('Error updating desarrollo units:', error);
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
