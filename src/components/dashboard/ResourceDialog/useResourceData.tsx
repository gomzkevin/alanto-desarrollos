
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ResourceType, 
  FormValues, 
  DesarrolloResource, 
  PrototipoResource, 
  LeadResource, 
  CotizacionResource, 
  FieldDefinition 
} from './types';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

const TIPOS_PROPIEDADES = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'villa', label: 'Villa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'otro', label: 'Otro' },
];

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
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { leads, statusOptions, getSubstatusOptions, originOptions } = useLeads();
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ 
    desarrolloId: selectedDesarrolloId 
  });

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
          
          if (resourceType === 'leads') {
            if (data.estado) {
              onStatusChange(data.estado);
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
            estado: 'nuevo',
            subestado: 'sin_contactar'
          } as LeadResource);
          onStatusChange('nuevo');
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
    };

    const defineFields = () => {
      let fieldDefinitions: FieldDefinition[] = [];

      switch (resourceType) {
        case 'desarrollos':
          fieldDefinitions = [
            { name: 'nombre', label: 'Nombre', type: 'text', tab: 'general' },
            { name: 'ubicacion', label: 'Ubicación', type: 'text', tab: 'general' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number', tab: 'general' },
            { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number', tab: 'general' },
            { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number', tab: 'general' },
            { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date', tab: 'general' },
            { name: 'fecha_entrega', label: 'Fecha Entrega', type: 'date', tab: 'general' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea', tab: 'general' },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload', tab: 'media', bucket: 'prototipo-images', folder: 'desarrollos' },
            { name: 'amenidades', label: 'Amenidades', type: 'amenities', tab: 'amenidades' },
            { name: 'moneda', label: 'Moneda', type: 'select', options: [
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' }
            ], tab: 'financiero' },
            { name: 'comision_operador', label: 'Comisión Operador (%)', type: 'number', tab: 'financiero' },
            { name: 'mantenimiento_valor', label: 'Mantenimiento', type: 'number', tab: 'financiero' },
            { name: 'es_mantenimiento_porcentaje', label: 'Mantenimiento es porcentaje', type: 'switch', tab: 'financiero' },
            { name: 'gastos_fijos', label: 'Gastos Fijos', type: 'number', tab: 'financiero' },
            { name: 'es_gastos_fijos_porcentaje', label: 'Gastos Fijos es porcentaje', type: 'switch', tab: 'financiero' },
            { name: 'gastos_variables', label: 'Gastos Variables (%)', type: 'number', tab: 'financiero' },
            { name: 'es_gastos_variables_porcentaje', label: 'Gastos Variables es porcentaje', type: 'switch', tab: 'financiero' },
            { name: 'impuestos', label: 'Impuestos (%)', type: 'number', tab: 'financiero' },
            { name: 'es_impuestos_porcentaje', label: 'Impuestos es porcentaje', type: 'switch', tab: 'financiero' },
            { name: 'adr_base', label: 'ADR Base', type: 'number', tab: 'financiero' },
            { name: 'ocupacion_anual', label: 'Ocupación Anual (%)', type: 'number', tab: 'financiero' },
          ];
          break;
        case 'prototipos':
          fieldDefinitions = [
            { name: 'nombre', label: 'Nombre', type: 'text', tab: 'general' },
            { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_PROPIEDADES, tab: 'general' },
            { name: 'precio', label: 'Precio', type: 'number', tab: 'general' },
            { name: 'superficie', label: 'Superficie (m²)', type: 'number', tab: 'general' },
            { name: 'habitaciones', label: 'Habitaciones', type: 'number', tab: 'general' },
            { name: 'baños', label: 'Baños', type: 'number', tab: 'general' },
            { name: 'estacionamientos', label: 'Estacionamientos', type: 'number', tab: 'general' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number', tab: 'detalles' },
            { name: 'unidades_vendidas', label: 'Unidades Vendidas', type: 'number', tab: 'detalles' },
            { name: 'unidades_con_anticipo', label: 'Unidades con Anticipo', type: 'number', tab: 'detalles' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea', tab: 'detalles' },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload', tab: 'media', bucket: 'prototipo-images', folder: 'prototipos' },
          ];
          break;
        case 'leads':
          fieldDefinitions = [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'agente', label: 'Agente', type: 'text' },
            { name: 'estado', label: 'Estado', type: 'select', options: statusOptions },
            { name: 'subestado', label: 'Subestado', type: 'select', options: selectedStatus ? getSubstatusOptions(selectedStatus) : [] },
            { name: 'origen', label: 'Origen', type: 'select', options: originOptions },
            { name: 'interes_en', label: 'Interés en', type: 'text' },
            { name: 'ultimo_contacto', label: 'Última fecha de contacto', type: 'date' },
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
          break;
        case 'cotizaciones':
          fieldDefinitions = [
            { name: 'lead_id', label: 'Lead', type: 'select', options: leads.map(lead => ({ value: lead.id, label: `${lead.nombre} ${lead.email ? `(${lead.email})` : lead.telefono ? `(${lead.telefono})` : ''}` })) },
            { name: 'desarrollo_id', label: 'Desarrollo', type: 'select', options: desarrollos.map(desarrollo => ({ value: desarrollo.id, label: desarrollo.nombre })) },
            { name: 'prototipo_id', label: 'Prototipo', type: 'select', options: prototipos.map(prototipo => ({ value: prototipo.id, label: prototipo.nombre })) },
            { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch' },
            { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number' },
            { name: 'numero_pagos', label: 'Número de Pagos', type: 'number' },
            ...(usarFiniquito ? [{ name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number' }] : []),
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
          break;
        default:
          fieldDefinitions = [];
          break;
      }

      setFields(fieldDefinitions);
    };

    fetchResource();
    defineFields();
  }, [resourceId, resourceType, toast, leads, desarrollos, prototipos, usarFiniquito, desarrolloId, selectedDesarrolloId, lead_id, statusOptions, getSubstatusOptions, originOptions, selectedStatus, onStatusChange, onAmenitiesChange]);

  return { resource, setResource, fields, isLoading };
}
