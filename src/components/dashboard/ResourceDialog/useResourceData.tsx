
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResourceType, FormValues } from './types';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import useUserRole from '@/hooks/useUserRole';

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
  defaultValues?: Record<string, any>;
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
  defaultValues = {}
}: UseResourceDataProps) => {
  const { toast } = useToast();
  const [resource, setResource] = useState<FormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUsarFiniquito, setUsarFiniquito] = useState(false);
  const { empresaId } = useUserRole();

  // Optimización para obtener recursos por ID usando useCallback
  const fetchResource = useCallback(async () => {
    try {
      let query;
      
      // Consulta optimizada con selección explícita de columnas
      switch (resourceType) {
        case 'desarrollos':
          query = supabase
            .from('desarrollos')
            .select('*')
            .eq('id', resourceId)
            .single();
          break;
        case 'prototipos':
          query = supabase
            .from('prototipos')
            .select('*')
            .eq('id', resourceId)
            .single();
          break;
        case 'leads':
          query = supabase
            .from('leads')
            .select('*')
            .eq('id', resourceId)
            .single();
          break;
        case 'cotizaciones':
          query = supabase
            .from('cotizaciones')
            .select(`
              *,
              desarrollo:desarrollos(id, nombre),
              prototipo:prototipos(id, nombre, precio),
              lead:leads(id, nombre, email, telefono)
            `)
            .eq('id', resourceId)
            .single();
          break;
        case 'unidades':
          query = supabase
            .from('unidades')
            .select(`
              *,
              prototipo:prototipos(id, nombre, desarrollo_id)
            `)
            .eq('id', resourceId)
            .single();
          break;
        default:
          return { data: null, error: new Error('Tipo de recurso no soportado') };
      }
      
      return await query;
    } catch (error) {
      console.error('Error fetching resource:', error);
      return { data: null, error };
    }
  }, [resourceId, resourceType]);
  
  // Función para obtener valores iniciales
  const getInitialValues = useCallback(() => {
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
          empresa_id: empresaId
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
          empresa_id: empresaId
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
          empresa_id: empresaId
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
    }
    
    return initialValues;
  }, [
    resourceType, 
    empresaId, 
    desarrolloId, 
    selectedDesarrolloId, 
    lead_id, 
    selectedStatus, 
    usarFiniquito
  ]);

  // Efecto para cargar el recurso
  useEffect(() => {
    const loadResource = async () => {
      setIsLoading(true);
      
      try {
        if (resourceId) {
          // Obtener recurso existente
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
            setResource(data);
            
            // Manejar configuración específica por tipo de recurso
            if (resourceType === 'leads' && data.estado && onStatusChange) {
              onStatusChange(data.estado);
            } else if (resourceType === 'desarrollos' && data.amenidades && onAmenitiesChange) {
              try {
                let amenidades = [];
                if (typeof data.amenidades === 'string') {
                  amenidades = JSON.parse(data.amenidades);
                } else if (Array.isArray(data.amenidades)) {
                  amenidades = data.amenidades;
                } else if (typeof data.amenidades === 'object' && data.amenidades !== null) {
                  const jsonObj = data.amenidades as Json;
                  amenidades = Object.values(jsonObj).map(val => String(val));
                }
                
                onAmenitiesChange(amenidades);
              } catch (error) {
                console.error('Error parsing amenidades:', error);
              }
            } else if (resourceType === 'cotizaciones' && data.usar_finiquito !== undefined) {
              setUsarFiniquito(data.usar_finiquito);
            }
          }
        } else {
          // Crear recurso vacío con valores predeterminados
          const initialValues = getInitialValues();
          
          // Fusionar con los valores proporcionados
          const mergedValues = {
            ...initialValues,
            ...defaultValues
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
  }, [
    resourceId, 
    resourceType, 
    desarrolloId, 
    lead_id, 
    fetchResource, 
    getInitialValues, 
    onAmenitiesChange, 
    onStatusChange, 
    defaultValues
  ]);
  
  return {
    resource,
    setResource,
    isLoading,
    fields: []
  };
};

export default useResourceData;
