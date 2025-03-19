import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from './types';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface UseResourceDataProps {
  resourceType: ResourceType;
  resourceId?: string;
  desarrolloId?: string;
  lead_id?: string;
  selectedDesarrolloId?: string | null;
  selectedStatus?: string | null;
  usarFiniquito?: boolean;
  selectedAmenities?: string[];
  onStatusChange?: (status: string) => void;
  onAmenitiesChange?: (amenities: string[]) => void;
  defaultValues?: Record<string, any>; // Add defaultValues prop
}

const useResourceData = ({
  resourceType,
  resourceId,
  desarrolloId,
  lead_id,
  selectedDesarrolloId,
  selectedStatus,
  usarFiniquito,
  selectedAmenities = [],
  onStatusChange,
  onAmenitiesChange,
  defaultValues = {} // Initialize with empty object
}: UseResourceDataProps) => {
  const { toast } = useToast();
  const [resource, setResource] = useState<FormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsarFiniquito, setUsarFiniquito] = useState(false);

  useEffect(() => {
    const loadResource = async () => {
      setIsLoading(true);
      
      try {
        if (resourceId) {
          // Fetch existing resource
          const { data, error } = await fetchResource();
          
          if (error) {
            console.error('Error loading resource:', error);
            toast({
              title: 'Error',
              description: 'No se pudo cargar el recurso',
              variant: 'destructive',
            });
            return;
          }
          
          if (data) {
            const resource = data;
            setResource(resource);
            
            // Handle specific resource type setup
            if (resourceType === 'leads' && resource.estado) {
              if (onStatusChange) {
                onStatusChange(resource.estado);
              }
            } else if (resourceType === 'desarrollos' && resource.amenidades) {
              try {
                let amenidades = [];
                if (typeof resource.amenidades === 'string') {
                  amenidades = JSON.parse(resource.amenidades);
                } else if (Array.isArray(resource.amenidades)) {
                  amenidades = resource.amenidades;
                } else if (typeof resource.amenidades === 'object' && resource.amenidades !== null) {
                  const jsonObj = resource.amenidades as Json;
                  amenidades = Object.values(jsonObj).map(val => String(val));
                }
                
                if (onAmenitiesChange) {
                  onAmenitiesChange(amenidades);
                }
              } catch (error) {
                console.error('Error parsing amenidades:', error);
              }
            } else if (resourceType === 'cotizaciones') {
              if (resource.usar_finiquito !== undefined) {
                setUsarFiniquito(resource.usar_finiquito);
              }
            }
          }
        } else {
          // Create new empty resource with default values
          const initialValues = getInitialValues();
          
          // Merge with provided defaultValues
          const mergedValues = {
            ...initialValues,
            ...defaultValues // Apply defaultValues over initial values
          };
          
          setResource(mergedValues);
        }
      } catch (error) {
        console.error('Error in loadResource:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadResource();
  }, [resourceId, resourceType, desarrolloId, lead_id]);

  // Function to get initial values for a new resource
  const getInitialValues = () => {
    let initialValues: FormValues = {};
    
    switch (resourceType) {
      case 'desarrollos':
        initialValues = {
          nombre: '',
          ubicacion: '',
          total_unidades: 0,
          unidades_disponibles: 0,
          avance_porcentaje: 0,
          descripcion: '',
          moneda: 'MXN',
        };
        break;
      case 'prototipos':
        initialValues = {
          nombre: '',
          desarrollo_id: desarrolloId || '',
          tipo: '',
          precio: 0,
          superficie: 0,
          habitaciones: 1,
          baños: 1,
          estacionamientos: 1,
          total_unidades: 0,
          unidades_disponibles: 0,
          descripcion: '',
        };
        break;
      case 'leads':
        initialValues = {
          nombre: '',
          email: '',
          telefono: '',
          estado: selectedStatus || 'nuevo',
          subestado: 'sin_contactar',
          origen: '',
          interes_en: '',
          notas: '',
        };
        break;
      case 'cotizaciones':
        initialValues = {
          desarrollo_id: desarrolloId || selectedDesarrolloId || '',
          lead_id: lead_id || '',
          prototipo_id: '',
          monto_anticipo: 0,
          usar_finiquito: usarFiniquito,
          numero_pagos: 12,
          notas: '',
        };
        break;
      case 'unidades':
        initialValues = {
          prototipo_id: '',
          numero: '',
          estado: 'disponible',
          nivel: '',
        };
        break;
      default:
        break;
    }
    
    return initialValues;
  };

  // Function to fetch resource by ID
  const fetchResource = async () => {
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
      
      return await query;
    } catch (error) {
      console.error('Error fetching resource:', error);
      return { data: null, error: error };
    }
  };
  
  return {
    resource,
    setResource,
    isLoading,
    fields: [] // This is typically populated by useResourceFields, which is used elsewhere
  };
};

export default useResourceData;
