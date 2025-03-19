
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ResourceType, 
  FormValues, 
  DesarrolloResource, 
  PrototipoResource, 
  LeadResource, 
  CotizacionResource
} from './types';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

export default function useResourceData({
  resourceType,
  resourceId,
  desarrolloId,
  lead_id,
  selectedDesarrolloId,
  selectedStatus,
  usarFiniquito,
  selectedAmenities,
  onStatusChange,
  onAmenitiesChange
}: {
  resourceType: ResourceType;
  resourceId?: string;
  desarrolloId?: string;
  lead_id?: string;
  selectedDesarrolloId: string | null;
  selectedStatus: string | null;
  usarFiniquito: boolean;
  selectedAmenities: string[];
  onStatusChange: (status: string) => void;
  onAmenitiesChange: (amenities: string[]) => void;
}) {
  const { toast } = useToast();
  const [resource, setResource] = useState<FormValues | null>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialFetchComplete, setInitialFetchComplete] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  const leadsResult = useLeads();
  const desarrollosResult = useDesarrollos();
  const prototipesResult = usePrototipos({ 
    desarrolloId: selectedDesarrolloId 
  });
  
  const leads = leadsResult.leads || [];
  const desarrollos = desarrollosResult.desarrollos || [];
  const prototipos = prototipesResult.prototipos || [];

  // Fetch resource data on initial load
  useEffect(() => {
    const fetchResource = async () => {
      setIsLoading(true);
      if (resourceId) {
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
        }
        
        if (query) {
          const { data, error } = await query;

          if (error) {
            console.error('Error fetching resource:', error);
            toast({
              title: 'Error',
              description: `No se pudo cargar el recurso: ${error.message}`,
              variant: 'destructive',
            });
          } else {
            setResource(data as FormValues);
            
            if (resourceType === 'desarrollos' && data.amenidades) {
              try {
                const parsedAmenities = typeof data.amenidades === 'string' 
                  ? JSON.parse(data.amenidades) 
                  : data.amenidades || [];
                onAmenitiesChange(parsedAmenities);
              } catch (e) {
                console.error('Error parsing amenities:', e);
                onAmenitiesChange([]);
              }
            }
            
            if (resourceType === 'leads' && data.estado) {
              onStatusChange(data.estado);
              setPrevStatus(data.estado);
            }
          }
        }
      } else {
        if (resourceType === 'prototipos' && desarrolloId) {
          setResource({
            desarrollo_id: desarrolloId,
            nombre: '',
            tipo: '',
            precio: 0,
            total_unidades: 0,
            unidades_disponibles: 0,
            unidades_vendidas: 0,
            unidades_con_anticipo: 0
          } as PrototipoResource);
        } else if (resourceType === 'desarrollos') {
          setResource({
            nombre: '',
            ubicacion: '',
            total_unidades: 0,
            unidades_disponibles: 0,
            amenidades: []
          } as DesarrolloResource);
        } else if (resourceType === 'leads') {
          setResource({
            nombre: '',
            email: '',
            telefono: '',
            estado: 'nuevo',
            subestado: 'sin_contactar'
          } as LeadResource);
          onStatusChange('nuevo');
          setPrevStatus('nuevo');
        } else if (resourceType === 'cotizaciones') {
          setResource({
            lead_id: lead_id || '',
            desarrollo_id: selectedDesarrolloId || '',
            prototipo_id: '',
            monto_anticipo: 0,
            numero_pagos: 0
          } as CotizacionResource);
        }
      }
      setIsLoading(false);
      setInitialFetchComplete(true);
    };

    fetchResource();
  }, [resourceId, resourceType, toast, desarrolloId, selectedDesarrolloId, lead_id, onStatusChange, onAmenitiesChange]);

  // Handle changes to status for leads
  useEffect(() => {
    if (initialFetchComplete && resourceType === 'leads' && selectedStatus && prevStatus !== selectedStatus) {
      setPrevStatus(selectedStatus);
      
      setResource(prev => {
        if (!prev) return prev;
        
        console.log("Updating status from", prevStatus, "to", selectedStatus);
        console.log("Current resource data:", prev);
        
        // Preserve all existing form data, only update estado and reset subestado
        return {
          ...prev,
          estado: selectedStatus,
          subestado: '' // Reset subestado when estado changes
        };
      });
    }
  }, [selectedStatus, initialFetchComplete, resourceType, prevStatus]);

  return { resource, setResource, fields, isLoading };
}
