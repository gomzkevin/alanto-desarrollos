
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Lead = Tables<"leads">;

// Status principal options
export const LEAD_STATUS_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' }
];

// Substatus options based on main status
export const LEAD_SUBSTATUS_OPTIONS = {
  nuevo: [
    { value: 'sin_contactar', label: 'Sin contactar' },
    { value: 'contacto_inicial', label: 'Contacto inicial' },
    { value: 'solicito_info', label: 'Solicitó información' }
  ],
  seguimiento: [
    { value: 'cotizacion_enviada', label: 'Cotización enviada' },
    { value: 'negociacion', label: 'En negociación' },
    { value: 'decidiendo', label: 'Decidiendo' },
    { value: 'requiere_visita', label: 'Requiere visita' }
  ],
  convertido: [
    { value: 'anticipo', label: 'Anticipo' },
    { value: 'venta', label: 'Venta' },
    { value: 'plan_pagos', label: 'Plan de pagos' },
    { value: 'finiquito', label: 'Finiquito' }
  ],
  perdido: [
    { value: 'sin_respuesta', label: 'Sin respuesta' },
    { value: 'cambio_opinion', label: 'Cambió de opinión' },
    { value: 'precio_alto', label: 'Precio alto' },
    { value: 'otro_desarrollo', label: 'Eligió otro desarrollo' },
    { value: 'otro', label: 'Otro motivo' }
  ]
};

export const LEAD_ORIGIN_OPTIONS = [
  { value: 'sitio_web', label: 'Sitio web' },
  { value: 'referido', label: 'Referido' },
  { value: 'evento', label: 'Evento' },
  { value: 'llamada', label: 'Llamada' },
  { value: 'redes_sociales', label: 'Redes sociales' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'portal_inmobiliario', label: 'Portal inmobiliario' },
  { value: 'visita_fisica', label: 'Visita física' },
  { value: 'campaña_email', label: 'Campaña de email' },
  { value: 'otro', label: 'Otro' }
];

type FetchLeadsOptions = {
  estado?: string;
  agente?: string;
  limit?: number;
  search?: string;
};

export const useLeads = (options: FetchLeadsOptions = {}) => {
  const { estado, agente, limit, search } = options;
  
  // Function to fetch leads
  const fetchLeads = async () => {
    console.log('Fetching leads with options:', options);
    
    try {
      let query = supabase
        .from('leads')
        .select('*');
        
      // Apply filters
      if (estado) {
        query = query.eq('estado', estado);
      }
      
      if (agente) {
        query = query.eq('agente', agente);
      }
      
      if (search) {
        query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      // Order by fecha_creacion descending
      query = query.order('fecha_creacion', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching leads:', error);
        throw new Error(error.message);
      }
      
      console.log('Leads fetched:', data);
      return data as Lead[];
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['leads', estado, agente, limit, search],
    queryFn: fetchLeads
  });

  // Function to get substatus options based on a status
  const getSubstatusOptions = (status: string) => {
    return LEAD_SUBSTATUS_OPTIONS[status as keyof typeof LEAD_SUBSTATUS_OPTIONS] || [];
  };

  // Function to find label for a given status value
  const getStatusLabel = (value: string | null) => {
    if (!value) return '';
    const option = LEAD_STATUS_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Function to find label for a given substatus value
  const getSubstatusLabel = (status: string | null, substatus: string | null) => {
    if (!status || !substatus) return '';
    const options = getSubstatusOptions(status);
    const option = options.find(opt => opt.value === substatus);
    return option ? option.label : substatus;
  };

  // Function to find label for a given origin value
  const getOriginLabel = (value: string | null) => {
    if (!value) return '';
    const option = LEAD_ORIGIN_OPTIONS.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return {
    leads: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    statusOptions: LEAD_STATUS_OPTIONS,
    getSubstatusOptions,
    originOptions: LEAD_ORIGIN_OPTIONS,
    getStatusLabel,
    getSubstatusLabel,
    getOriginLabel
  };
};

export default useLeads;
