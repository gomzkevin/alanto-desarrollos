
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

const useLeads = () => {
  const { empresaId } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Fetch leads
  const { data: leads = [], isLoading, error, refetch } = useQuery({
    queryKey: ['leads', empresaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!empresaId,
  });

  // Create lead
  const createLead = useMutation({
    mutationFn: async (newLead: any) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...newLead, empresa_id: empresaId }])
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
  };
};

export default useLeads;
