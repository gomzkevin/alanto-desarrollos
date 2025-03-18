
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import useResourceData from '../useResourceData';
import useResourceActions from '../useResourceActions';
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
  
  const { 
    fetchResourceById, 
    isLoading: isLoadingResource,
    formatValuesForDisplay
  } = useResourceData({
    resourceType,
    resourceId
  });
  
  const {
    isSubmitting,
    uploading,
    handleImageUpload,
    saveResource: saveResourceAction
  } = useResourceActions({
    resourceType,
    resourceId,
    desarrolloId,
    onSuccess,
    onSave,
    selectedAmenities
  });
  
  useEffect(() => {
    const loadResource = async () => {
      try {
        if (resourceId) {
          // Fetch existing resource by ID
          const fetchedResource = await fetchResourceById();
          
          if (fetchedResource) {
            setResource(formatValuesForDisplay(fetchedResource));
            
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
      }
    };
    
    if (!isResourceFetched) {
      loadResource();
    }
    
    return () => {
      setIsResourceFetched(false);
    };
  }, [resourceId, resourceType]);

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
  
  const saveResource = async (updatedResource?: FormValues): Promise<boolean> => {
    if (!resource && !updatedResource) return false;
    
    const resourceToSave = updatedResource || resource;
    if (!resourceToSave) return false;
    
    return await saveResourceAction(resourceToSave);
  };

  return {
    isLoading: isLoadingResource && !isResourceFetched,
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
