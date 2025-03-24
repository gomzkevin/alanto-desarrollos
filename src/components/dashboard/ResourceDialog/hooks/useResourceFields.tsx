import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FieldDefinition, ResourceType } from '../types';
import useLeads, { LEAD_STATUS_OPTIONS, LEAD_SUBSTATUS_OPTIONS, LEAD_ORIGIN_OPTIONS } from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

const ESTADOS_UNIDAD = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'apartado', label: 'Apartado' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'vendido', label: 'Vendido' }
];

const TIPOS_PROPIEDADES = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'villa', label: 'Villa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'otro', label: 'Otro' },
];

export const useResourceFields = (resourceType: ResourceType, selectedStatus?: string | null) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const { leads } = useLeads();
  const { desarrollos } = useDesarrollos({
    onSuccess: () => {},
    onError: (error) => console.error("Error fetching desarrollos:", error)
  });
  const { prototipos } = usePrototipos();
  
  // Obtener la lista de vendedores desde la tabla de usuarios
  const { data: vendedores = [] } = useQuery({
    queryKey: ['vendedores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre')
        .eq('rol', 'vendedor')
        .eq('activo', true);
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const getFieldDefinitions = (): FieldDefinition[] => {
      switch (resourceType) {
        case 'unidades':
          return [
            { 
              name: 'numero', 
              label: 'Número/Identificador', 
              type: 'text', 
              required: true, 
              description: 'Identificador único de la unidad (ej. "Unidad 101")' 
            },
            { 
              name: 'estado', 
              label: 'Estado', 
              type: 'select', 
              options: ESTADOS_UNIDAD, 
              required: true, 
              description: 'Estado actual de la unidad',
              placeholder: 'Seleccionar estado...'
            },
            { 
              name: 'nivel', 
              label: 'Nivel/Piso', 
              type: 'text', 
              description: 'Piso o nivel donde se encuentra la unidad' 
            },
            { 
              name: 'precio_venta', 
              label: 'Precio de Venta', 
              type: 'number', 
              description: 'Precio de venta de la unidad' 
            },
            { 
              name: 'comprador_id', 
              label: 'Comprador', 
              type: 'select', 
              options: leads.map(lead => ({ value: lead.id, label: lead.nombre })), 
              description: 'Cliente que ha comprado o reservado esta unidad',
              placeholder: 'Seleccionar comprador...'
            },
            { 
              name: 'comprador_nombre', 
              label: 'Nombre del Comprador', 
              type: 'text', 
              description: 'Nombre del comprador en caso de no estar registrado como lead' 
            },
            { 
              name: 'vendedor_id', 
              label: 'Vendedor', 
              type: 'select', 
              options: vendedores.map(v => ({ value: v.id, label: v.nombre })), 
              description: 'Agente de ventas asignado a esta unidad',
              placeholder: 'Seleccionar vendedor...'
            },
            { 
              name: 'vendedor_nombre', 
              label: 'Nombre del Vendedor', 
              type: 'text', 
              description: 'Nombre del vendedor en caso de no estar registrado en el sistema' 
            },
            { 
              name: 'fecha_venta', 
              label: 'Fecha de Venta/Apartado', 
              type: 'date', 
              description: 'Fecha en que se realizó la venta o apartado' 
            },
          ];
        case 'desarrollos':
          return [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'ubicacion', label: 'Ubicación', type: 'text' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' },
            { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number', readOnly: true },
            { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number', readOnly: true },
            { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
            { name: 'fecha_entrega', label: 'Fecha Entrega', type: 'date' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload', bucket: 'prototipo-images', folder: 'desarrollos' },
            { name: 'amenidades', label: 'Amenidades', type: 'amenities' },
            { name: 'moneda', label: 'Moneda', type: 'select', options: [
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' }
            ], placeholder: 'Seleccionar moneda...' },
            { name: 'comision_operador', label: 'Comisión Operador (%)', type: 'number' },
            { name: 'mantenimiento_valor', label: 'Mantenimiento', type: 'number' },
            { name: 'es_mantenimiento_porcentaje', label: 'Mantenimiento es porcentaje', type: 'switch' },
            { name: 'gastos_fijos', label: 'Gastos Fijos', type: 'number' },
            { name: 'es_gastos_fijos_porcentaje', label: 'Gastos Fijos es porcentaje', type: 'switch' },
            { name: 'gastos_variables', label: 'Gastos Variables (%)', type: 'number' },
            { name: 'es_gastos_variables_porcentaje', label: 'Gastos Variables es porcentaje', type: 'switch' },
            { name: 'impuestos', label: 'Impuestos (%)', type: 'number' },
            { name: 'es_impuestos_porcentaje', label: 'Impuestos es porcentaje', type: 'switch' },
            { name: 'adr_base', label: 'ADR Base', type: 'number' },
            { name: 'ocupacion_anual', label: 'Ocupación Anual (%)', type: 'number' },
          ];
        case 'prototipos':
          return [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_PROPIEDADES, placeholder: 'Seleccionar tipo...' },
            { name: 'precio', label: 'Precio', type: 'number', formatCurrency: true },
            { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
            { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
            { name: 'baños', label: 'Baños', type: 'number' },
            { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' },
            { name: 'unidades_vendidas', label: 'Unidades Vendidas', type: 'number', readOnly: true },
            { name: 'unidades_con_anticipo', label: 'Unidades con Anticipo', type: 'number', readOnly: true },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload', bucket: 'prototipo-images', folder: 'prototipos' },
          ];
        case 'leads':
          const substatusOptions = selectedStatus && LEAD_SUBSTATUS_OPTIONS[selectedStatus as keyof typeof LEAD_SUBSTATUS_OPTIONS] 
            ? LEAD_SUBSTATUS_OPTIONS[selectedStatus as keyof typeof LEAD_SUBSTATUS_OPTIONS] 
            : [];
          
          return [
            { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ingrese el nombre completo...' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'ejemplo@correo.com' },
            { name: 'telefono', label: 'Teléfono', type: 'text', placeholder: '+52 1234567890' },
            { name: 'agente', label: 'Agente', type: 'text', placeholder: 'Nombre del agente asignado...' },
            { 
              name: 'estado', 
              label: 'Estado', 
              type: 'select', 
              options: LEAD_STATUS_OPTIONS,
              placeholder: 'Seleccionar estado...'
            },
            { 
              name: 'subestado', 
              label: 'Subestado', 
              type: 'select', 
              options: substatusOptions,
              placeholder: 'Seleccione un subestado...'
            },
            { 
              name: 'origen', 
              label: 'Origen', 
              type: 'select', 
              options: LEAD_ORIGIN_OPTIONS,
              placeholder: 'Seleccione un origen...'
            },
            { 
              name: 'interes_en', 
              label: 'Interés en', 
              type: 'interest-selector'
            },
            { name: 'ultimo_contacto', label: 'Última fecha de contacto', type: 'date' },
            { name: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Escriba notas adicionales sobre el prospecto...' },
          ];
        case 'cotizaciones':
          return [
            { 
              name: 'lead_id', 
              label: 'Lead', 
              type: 'select', 
              options: leads.map(lead => ({ 
                value: lead.id, 
                label: lead.nombre + (lead.email ? ` (${lead.email})` : lead.telefono ? ` (${lead.telefono})` : '')
              })),
              placeholder: 'Seleccionar cliente...'
            },
            { 
              name: 'desarrollo_id', 
              label: 'Desarrollo', 
              type: 'select', 
              options: desarrollos.map(d => ({ value: d.id, label: d.nombre })),
              placeholder: 'Seleccionar desarrollo...'
            },
            { 
              name: 'prototipo_id', 
              label: 'Prototipo', 
              type: 'select', 
              options: prototipos.map(p => ({ value: p.id, label: p.nombre })),
              placeholder: 'Seleccionar prototipo...'
            },
            { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch' },
            { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number', placeholder: '0.00' },
            { name: 'numero_pagos', label: 'Número de Pagos', type: 'number', placeholder: '0' },
            { name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number', placeholder: '0.00' },
            { name: 'notas', label: 'Notas', type: 'textarea', placeholder: 'Notas adicionales sobre la cotización...' },
          ];
        default:
          return [];
      }
    };

    setFields(getFieldDefinitions());
  }, [resourceType, leads, vendedores, selectedStatus, desarrollos, prototipos]);

  return fields;
};
