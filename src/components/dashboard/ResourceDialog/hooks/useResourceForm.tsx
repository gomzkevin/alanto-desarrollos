
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from '../types';
import { useToast } from '@/hooks/use-toast';

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
  
  useEffect(() => {
    const loadResource = async () => {
      setIsLoading(true);
      try {
        if (resourceId) {
          // Fetch existing resource by ID
          const fetchedResource = await fetchResourceById();
          
          if (fetchedResource) {
            // Format values for display
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
          // Create new resource template based on resource type
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
              ocupacion_anual: 70
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
              ultimo_contacto: new Date().toISOString()
            };
          } else if (resourceType === 'cotizaciones') {
            initialResource = {
              lead_id: lead_id || '',
              desarrollo_id: desarrolloId || '',
              prototipo_id: prototipo_id || '',
              monto_anticipo: 0,
              numero_pagos: 6,
              usar_finiquito: false,
              notas: ''
            };
          } else if (resourceType === 'unidades') {
            initialResource = {
              prototipo_id: prototipo_id || '',
              numero: '',
              nivel: '',
              estado: 'disponible'
            };
          }
          
          // Apply any default values provided
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

  // Fetch resource by ID
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
  
  // Format resource values for display
  const formatValuesForDisplay = (resource: FormValues): FormValues => {
    if (!resource) return {};
    
    const formattedResource = { ...resource };
    
    // Handle specific formatting based on resource type
    if (resourceType === 'desarrollos') {
      // Format any values needed for desarrollos
    } else if (resourceType === 'prototipos') {
      // Format any values needed for prototipos
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
      // Reset subestado when estado changes
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
      
      // Update resource with new image URL
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
      let query;
      const dataToSave = { ...resourceToSave };
      
      // Handle special cases by resource type
      if (resourceType === 'desarrollos') {
        // Convert amenities array to JSON string for storage
        if (selectedAmenities.length > 0) {
          dataToSave.amenidades = selectedAmenities;
        }
      }
      
      if (resourceId) {
        // Update existing resource
        if (resourceType === 'desarrollos') {
          query = supabase
            .from('desarrollos')
            .update(dataToSave)
            .eq('id', resourceId);
        } else if (resourceType === 'prototipos') {
          query = supabase
            .from('prototipos')
            .update(dataToSave)
            .eq('id', resourceId);
        } else if (resourceType === 'leads') {
          query = supabase
            .from('leads')
            .update(dataToSave)
            .eq('id', resourceId);
        } else if (resourceType === 'cotizaciones') {
          query = supabase
            .from('cotizaciones')
            .update(dataToSave)
            .eq('id', resourceId);
        } else if (resourceType === 'unidades') {
          query = supabase
            .from('unidades')
            .update(dataToSave)
            .eq('id', resourceId);
        }
      } else {
        // Insert new resource
        if (resourceType === 'desarrollos') {
          query = supabase
            .from('desarrollos')
            .insert(dataToSave);
        } else if (resourceType === 'prototipos') {
          query = supabase
            .from('prototipos')
            .insert(dataToSave);
        } else if (resourceType === 'leads') {
          query = supabase
            .from('leads')
            .insert(dataToSave);
        } else if (resourceType === 'cotizaciones') {
          query = supabase
            .from('cotizaciones')
            .insert(dataToSave);
        } else if (resourceType === 'unidades') {
          query = supabase
            .from('unidades')
            .insert(dataToSave);
        }
      }
      
      const { error } = await query;
      
      if (error) {
        console.error('Error saving resource:', error);
        toast({
          title: 'Error',
          description: `No se pudo guardar el recurso: ${error.message}`,
          variant: 'destructive',
        });
        return false;
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
