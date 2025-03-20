import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from '../types';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import useUserRole from '@/hooks/useUserRole';

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

export const useResourceForm = ({
  resourceType,
  resourceId,
  desarrolloId,
  lead_id,
  prototipo_id,
  defaultValues,
  onSuccess,
  onSave
}: UseResourceFormProps) => {
  const { toast } = useToast();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [resource, setResource] = useState<FormValues | null>(null);
  const [isResourceFetched, setIsResourceFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { empresaId } = useUserRole();

  useEffect(() => {
    const loadResource = async () => {
      setIsLoading(true);
      try {
        if (resourceId) {
          const fetchedResource = await fetchResourceById();
          
          if (fetchedResource) {
            const formattedResource = formatValuesForDisplay(fetchedResource);
            setResource(formattedResource);
            
            if (resourceType === 'desarrollos' && fetchedResource.amenidades) {
              try {
                let amenidades = [];
                if (typeof fetchedResource.amenidades === 'string') {
                  amenidades = JSON.parse(fetchedResource.amenidades);
                } else if (Array.isArray(fetchedResource.amenidades)) {
                  amenidades = fetchedResource.amenidades;
                }
                setSelectedAmenities(amenidades);
              } catch (error) {
                console.error('Error parsing amenidades:', error);
                setSelectedAmenities([]);
              }
            }
          }
        } else {
          let initialResource: FormValues = {};
          
          if (resourceType === 'prototipos' && desarrolloId) {
            initialResource = {
              desarrollo_id: desarrolloId,
              nombre: '',
              tipo: '',
              precio: 0,
              superficie: 0,
              habitaciones: 0,
              baños: 0,
              estacionamientos: 0,
              total_unidades: 0,
              unidades_disponibles: 0,
              descripcion: ''
            };
          } else if (resourceType === 'desarrollos') {
            initialResource = {
              nombre: '',
              ubicacion: '',
              descripcion: '',
              total_unidades: 0,
              unidades_disponibles: 0,
              avance_porcentaje: 0,
              moneda: 'MXN',
              comision_operador: 15,
              mantenimiento_valor: 5,
              es_mantenimiento_porcentaje: true,
              gastos_fijos: 2500,
              es_gastos_fijos_porcentaje: false,
              gastos_variables: 12,
              es_gastos_variables_porcentaje: true,
              impuestos: 35,
              es_impuestos_porcentaje: true,
              adr_base: 1800,
              ocupacion_anual: 70,
              empresa_id: empresaId
            };
          } else if (resourceType === 'leads') {
            initialResource = {
              nombre: '',
              email: '',
              telefono: '',
              origen: '',
              estado: 'nuevo',
              subestado: 'sin_contactar',
              agente: '',
              interes_en: '',
              notas: '',
              ultimo_contacto: new Date().toISOString(),
              empresa_id: empresaId
            };
          } else if (resourceType === 'cotizaciones') {
            initialResource = {
              lead_id: lead_id || '',
              desarrollo_id: desarrolloId || '',
              prototipo_id: prototipo_id || '',
              monto_anticipo: 0,
              numero_pagos: 6,
              usar_finiquito: false,
              notas: '',
              empresa_id: empresaId
            };
          } else if (resourceType === 'unidades') {
            initialResource = {
              prototipo_id: prototipo_id || '',
              numero: '',
              nivel: '',
              estado: 'disponible'
            };
          }
          
          if (defaultValues) {
            initialResource = {
              ...initialResource,
              ...defaultValues
            };
          }
          
          setResource(initialResource);
        }
        
        setIsResourceFetched(true);
      } catch (error) {
        console.error('Error loading resource:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el recurso',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!isResourceFetched) {
      loadResource();
    }
    
    return () => {
      setIsResourceFetched(false);
    };
  }, [resourceId, resourceType]);

  const fetchResourceById = async (): Promise<FormValues | null> => {
    try {
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
      } else if (resourceType === 'unidades') {
        query = supabase
          .from('unidades')
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
        return null;
      }
      
      return data as FormValues;
    } catch (error) {
      console.error('Error in fetchResourceById:', error);
      return null;
    }
  };
  
  const formatValuesForDisplay = (resource: FormValues): FormValues => {
    if (!resource) return {};
    
    const formattedResource = { ...resource };
    
    if (resourceType === 'desarrollos') {
    } else if (resourceType === 'prototipos') {
    }
    
    return formattedResource;
  };

  const handleChange = (values: FormValues) => {
    if (!resource) return;
    setResource({
      ...resource,
      ...values
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!resource) return;
    
    if (name === 'estado' && resourceType === 'leads') {
      setResource({
        ...resource,
        [name]: value,
        subestado: ''
      });
    } else {
      setResource({
        ...resource,
        [name]: value
      });
    }
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
    setResource({
      ...resource,
      lead_id: leadId
    });
  };
  
  const handleAmenitiesChange = (amenities: string[]) => {
    setSelectedAmenities(amenities);
  };
  
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (!resource) return;
    setResource({
      ...resource,
      [name]: date ? date.toISOString() : null
    });
  };
  
  const handleImageUpload = async (file: File, bucket: string, folder: string, fieldName: string): Promise<string | null> => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      
      if (resource) {
        setResource({
          ...resource,
          [fieldName]: publicUrl
        });
      }
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir la imagen',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveResource = async (updatedResource?: FormValues): Promise<boolean> => {
    if (!resource && !updatedResource) return false;
    
    const resourceToSave = updatedResource || resource;
    if (!resourceToSave) return false;
    
    setIsSubmitting(true);
    try {
      if ((resourceType === 'desarrollos' || resourceType === 'leads' || resourceType === 'cotizaciones') 
          && !resourceToSave.empresa_id && empresaId) {
        resourceToSave.empresa_id = empresaId;
      }
      
      let dataToSave: Record<string, any> = { ...resourceToSave };
      
      if (resourceType === 'desarrollos' && selectedAmenities.length > 0) {
        dataToSave.amenidades = selectedAmenities;
      }
      
      const validationError = validateResourceData(dataToSave);
      if (validationError) {
        toast({
          title: 'Error de validación',
          description: validationError,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return false;
      }
      
      if (resourceId) {
        if (resourceType === 'desarrollos') {
          const { error } = await supabase
            .from('desarrollos')
            .update(dataToSave as {
              nombre: string;
              ubicacion: string;
              total_unidades: number;
              unidades_disponibles: number;
              empresa_id: number;
              // other optional fields are included in the type
            })
            .eq('id', resourceId);
            
          if (error) throw error;
        } else if (resourceType === 'prototipos') {
          const { error } = await supabase
            .from('prototipos')
            .update(dataToSave as {
              nombre: string;
              desarrollo_id: string;
              tipo: string;
              precio: number;
              total_unidades: number;
              unidades_disponibles: number;
              // other optional fields
            })
            .eq('id', resourceId);
            
          if (error) throw error;
        } else if (resourceType === 'leads') {
          const { error } = await supabase
            .from('leads')
            .update(dataToSave as {
              nombre: string;
              empresa_id?: number;
              // other optional fields
            })
            .eq('id', resourceId);
            
          if (error) throw error;
        } else if (resourceType === 'cotizaciones') {
          const { error } = await supabase
            .from('cotizaciones')
            .update(dataToSave as {
              lead_id: string;
              desarrollo_id: string;
              prototipo_id: string;
              monto_anticipo: number;
              numero_pagos: number;
              // other optional fields
            })
            .eq('id', resourceId);
            
          if (error) throw error;
        } else if (resourceType === 'unidades') {
          const { error } = await supabase
            .from('unidades')
            .update(dataToSave as {
              numero: string;
              prototipo_id: string;
              // other optional fields
            })
            .eq('id', resourceId);
            
          if (error) throw error;
        }
      } else {
        if (resourceType === 'desarrollos') {
          const { error } = await supabase
            .from('desarrollos')
            .insert(dataToSave as {
              nombre: string;
              ubicacion: string;
              total_unidades: number;
              unidades_disponibles: number;
              empresa_id: number;
              // other optional fields
            });
            
          if (error) throw error;
        } else if (resourceType === 'prototipos') {
          const { error } = await supabase
            .from('prototipos')
            .insert(dataToSave as {
              nombre: string;
              desarrollo_id: string;
              tipo: string;
              precio: number;
              total_unidades: number;
              unidades_disponibles: number;
              // other optional fields
            });
            
          if (error) throw error;
        } else if (resourceType === 'leads') {
          const { error } = await supabase
            .from('leads')
            .insert(dataToSave as {
              nombre: string;
              empresa_id?: number;
              // other optional fields
            });
            
          if (error) throw error;
        } else if (resourceType === 'cotizaciones') {
          const { error } = await supabase
            .from('cotizaciones')
            .insert(dataToSave as {
              lead_id: string;
              desarrollo_id: string;
              prototipo_id: string;
              monto_anticipo: number;
              numero_pagos: number;
              // other optional fields
            });
            
          if (error) throw error;
        } else if (resourceType === 'unidades') {
          const { error } = await supabase
            .from('unidades')
            .insert(dataToSave as {
              numero: string;
              prototipo_id: string;
              // other optional fields
            });
            
          if (error) throw error;
        }
      }
      
      toast({
        title: 'Éxito',
        description: `${resourceId ? 'Actualizado' : 'Creado'} correctamente`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onSave) {
        onSave();
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveResource:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el recurso',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateResourceData = (data: Record<string, any>): string | null => {
    if (resourceType === 'desarrollos') {
      if (!data.nombre) return 'El nombre es requerido';
      if (!data.ubicacion) return 'La ubicación es requerida';
      if (data.total_unidades === undefined) return 'El total de unidades es requerido';
      if (data.unidades_disponibles === undefined) return 'Las unidades disponibles son requeridas';
      if (!data.empresa_id) return 'El ID de la empresa es requerido';
    } else if (resourceType === 'prototipos') {
      if (!data.nombre) return 'El nombre es requerido';
      if (!data.desarrollo_id) return 'El desarrollo es requerido';
      if (!data.tipo) return 'El tipo es requerido';
      if (data.precio === undefined) return 'El precio es requerido';
      if (data.total_unidades === undefined) return 'El total de unidades es requerido';
      if (data.unidades_disponibles === undefined) return 'Las unidades disponibles son requeridas';
    } else if (resourceType === 'leads') {
      if (!data.nombre) return 'El nombre es requerido';
      if (!data.empresa_id) return 'El ID de la empresa es requerido';
    } else if (resourceType === 'cotizaciones') {
      if (!data.lead_id) return 'El lead es requerido';
      if (!data.desarrollo_id) return 'El desarrollo es requerido';
      if (!data.prototipo_id) return 'El prototipo es requerido';
      if (data.monto_anticipo === undefined) return 'El monto del anticipo es requerido';
      if (data.numero_pagos === undefined) return 'El número de pagos es requerido';
      if (!data.empresa_id) return 'El ID de la empresa es requerido';
    } else if (resourceType === 'unidades') {
      if (!data.numero) return 'El número es requerido';
      if (!data.prototipo_id) return 'El prototipo es requerido';
    }
    
    return null;
  };

  return {
    isLoading,
    isSubmitting,
    resource,
    selectedAmenities,
    setResource,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleLeadSelect,
    handleAmenitiesChange,
    saveResource,
    handleImageUpload,
    uploading,
    handleDateChange
  };
};

export default useResourceForm;
