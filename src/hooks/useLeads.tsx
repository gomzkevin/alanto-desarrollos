
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export const LEAD_STATUS_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'interesado', label: 'Interesado' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'negociación', label: 'En Negociación' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
  { value: 'inactivo', label: 'Inactivo' }
];

export const LEAD_SUBSTATUS_OPTIONS = {
  nuevo: [
    { value: 'sin_contactar', label: 'Sin Contactar' },
    { value: 'pendiente_validacion', label: 'Pendiente de Validación' }
  ],
  contactado: [
    { value: 'mensaje_enviado', label: 'Mensaje Enviado' },
    { value: 'llamada_realizada', label: 'Llamada Realizada' },
    { value: 'reunión_agendada', label: 'Reunión Agendada' }
  ],
  interesado: [
    { value: 'solicitó_información', label: 'Solicitó Información' },
    { value: 'interesado_visitar', label: 'Interesado en Visitar' },
    { value: 'evaluando_opciones', label: 'Evaluando Opciones' }
  ],
  calificado: [
    { value: 'capacidad_compra', label: 'Capacidad de Compra' },
    { value: 'intención_compra', label: 'Intención de Compra' },
    { value: 'buscando_financiamiento', label: 'Buscando Financiamiento' }
  ],
  negociación: [
    { value: 'enviada_cotización', label: 'Cotización Enviada' },
    { value: 'negociando_terminos', label: 'Negociando Términos' },
    { value: 'decidiendo', label: 'Tomando Decisión' }
  ],
  ganado: [
    { value: 'contrato_firmado', label: 'Contrato Firmado' },
    { value: 'anticipo_recibido', label: 'Anticipo Recibido' },
    { value: 'venta_completada', label: 'Venta Completada' }
  ],
  perdido: [
    { value: 'precio', label: 'Precio' },
    { value: 'competencia', label: 'Competencia' },
    { value: 'timing', label: 'Timing' },
    { value: 'no_interesado', label: 'No Interesado' },
    { value: 'sin_respuesta', label: 'Sin Respuesta' }
  ],
  inactivo: [
    { value: 'fuera_mercado', label: 'Fuera del Mercado' },
    { value: 'seguimiento_futuro', label: 'Seguimiento Futuro' },
    { value: 'datos_incorrectos', label: 'Datos Incorrectos' }
  ]
};

export const LEAD_ORIGIN_OPTIONS = [
  { value: 'sitio_web', label: 'Sitio Web' },
  { value: 'redes_sociales', label: 'Redes Sociales' },
  { value: 'referido', label: 'Referido' },
  { value: 'llamada', label: 'Llamada' },
  { value: 'email', label: 'Email' },
  { value: 'portal', label: 'Portal Inmobiliario' },
  { value: 'evento', label: 'Evento' },
  { value: 'otro', label: 'Otro' }
];

export interface LeadType {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  estado: string;
  subestado: string;
  origen: string;
  interes_en: string;
  notas: string;
  agente: string;
  empresa_id: number;
  fecha_creacion: string;
  ultimo_contacto: string;
}

// Export LeadType as Lead for backward compatibility
export type Lead = LeadType;

interface UseLeadsOptions {
  estado?: string;
  search?: string;
  empresa_id?: number;
  limit?: number;
}

const useLeads = (options: UseLeadsOptions = {}) => {
  const { empresaId } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  const empresa_id = options.empresa_id || empresaId;

  // Fetch leads
  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leads', empresa_id, options.estado, options.search, options.limit],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('empresa_id', empresa_id)
        .order('fecha_creacion', { ascending: false });

      if (options.estado) {
        query = query.eq('estado', options.estado);
      }

      if (options.search && options.search.length > 2) {
        query = query.or(`nombre.ilike.%${options.search}%,email.ilike.%${options.search}%,telefono.ilike.%${options.search}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!empresa_id,
  });

  // Create lead
  const createLead = useMutation({
    mutationFn: async (newLead: any) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...newLead, empresa_id: empresa_id }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead creado",
        description: "El lead ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear el lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update lead
  const updateLead = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead actualizado",
        description: "El lead ha sido actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete lead
  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead eliminado",
        description: "El lead ha sido eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar el lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Helper functions to get labels
  const getStatusLabel = (status: string | null) => {
    if (!status) return '';
    const statusOption = LEAD_STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  const getSubstatusLabel = (status: string | null, substatus: string | null) => {
    if (!status || !substatus) return '';
    
    const substatusOptions = LEAD_SUBSTATUS_OPTIONS[status as keyof typeof LEAD_SUBSTATUS_OPTIONS] || [];
    const option = substatusOptions.find(opt => opt.value === substatus);
    return option ? option.label : substatus;
  };

  const getOriginLabel = (origin: string | null) => {
    if (!origin) return '';
    const originOption = LEAD_ORIGIN_OPTIONS.find(opt => opt.value === origin);
    return originOption ? originOption.label : origin;
  };

  return {
    leads,
    isLoading,
    error,
    refetch,
    createLead,
    updateLead,
    deleteLead,
    selectedStatus,
    setSelectedStatus,
    statusOptions: LEAD_STATUS_OPTIONS,
    getStatusLabel,
    getSubstatusLabel,
    getOriginLabel
  };
};

export default useLeads;
