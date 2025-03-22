
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import useDesarrollos from './useDesarrollos';
import usePrototipos from './usePrototipos';
import useUserRole from './useUserRole';

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
  empresa_id?: number | null;
};

export const useLeads = (options: FetchLeadsOptions = {}) => {
  const { estado, agente, limit, search, empresa_id } = options;
  const { toast } = useToast();
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos();
  const { empresaId: userEmpresaId } = useUserRole();
  
  // Use the specified empresa_id or fall back to the user's empresa_id
  const effectiveEmpresaId = empresa_id !== undefined ? empresa_id : userEmpresaId;
  
  console.log("useLeads initialization with options:", { ...options, empresaId: effectiveEmpresaId });
  console.log("Lead status options:", LEAD_STATUS_OPTIONS);
  console.log("Lead origin options:", LEAD_ORIGIN_OPTIONS);
  
  // Function to fetch leads
  const fetchLeads = async () => {
    console.log('Fetching leads with options:', { ...options, empresaId: effectiveEmpresaId });
    
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
      
      // Filter by empresa_id if provided
      if (effectiveEmpresaId) {
        query = query.eq('empresa_id', effectiveEmpresaId);
        console.log('Filtering leads by empresa_id:', effectiveEmpresaId);
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
        toast({
          title: 'Error',
          description: `Error al cargar los prospectos: ${error.message}`,
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      console.log('Leads fetched:', data);
      return data as Lead[];
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      toast({
        title: 'Error de conexión',
        description: 'No se pudieron cargar los prospectos. Intente nuevamente.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Function to update lead
  const updateLead = async (id: string, updatedData: Partial<Lead>) => {
    try {
      console.log('Updating lead with data:', updatedData);
      
      // Ensure empresa_id is set if not already present
      if (!updatedData.empresa_id && effectiveEmpresaId) {
        updatedData.empresa_id = effectiveEmpresaId;
      }
      
      const { data, error } = await supabase
        .from('leads')
        .update(updatedData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Error updating lead:', error);
        toast({
          title: 'Error',
          description: `No se pudo actualizar el prospecto: ${error.message}`,
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      toast({
        title: 'Prospecto actualizado',
        description: 'El prospecto se ha actualizado correctamente',
      });
      
      return data;
    } catch (error) {
      console.error('Error in updateLead:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['leads', estado, agente, limit, search, effectiveEmpresaId],
    queryFn: fetchLeads,
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
  });

  // Function to get substatus options based on a status
  const getSubstatusOptions = (status: string) => {
    console.log("Getting substatus options for status:", status);
    const options = LEAD_SUBSTATUS_OPTIONS[status as keyof typeof LEAD_SUBSTATUS_OPTIONS] || [];
    console.log("Substatus options:", options);
    return options;
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

  // Function to get the interest text based on the interest_en value
  const getInterestText = (interest: string | null) => {
    if (!interest) return '';
    
    if (interest.startsWith('desarrollo:')) {
      const desarrolloId = interest.split(':')[1];
      const desarrollo = desarrollos.find(d => d.id === desarrolloId);
      return desarrollo ? `Desarrollo: ${desarrollo.nombre}` : interest;
    } else if (interest.startsWith('prototipo:')) {
      const prototipoId = interest.split(':')[1];
      const prototipo = prototipos.find(p => p.id === prototipoId);
      const desarrollo = prototipo 
        ? desarrollos.find(d => d.id === prototipo.desarrollo_id) 
        : null;
      return prototipo 
        ? `${prototipo.nombre}${desarrollo ? ` en ${desarrollo.nombre}` : ''}` 
        : interest;
    }
    
    return interest;
  };

  return {
    leads: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    updateLead,
    statusOptions: LEAD_STATUS_OPTIONS,
    getSubstatusOptions,
    originOptions: LEAD_ORIGIN_OPTIONS,
    getStatusLabel,
    getSubstatusLabel,
    getOriginLabel,
    getInterestText
  };
};

export default useLeads;
