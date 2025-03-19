import { useMemo } from 'react';
import { FieldDefinition } from '../types';

export function useResourceFields(resourceType: string, selectedStatus?: string): FieldDefinition[] {
  const fields = useMemo(() => {
    switch (resourceType) {
      case 'desarrollos':
        return useDesarrolloFields();
      case 'prototipos':
        return usePrototipoFields();
      case 'leads':
        return useLeadFields(selectedStatus);
      case 'cotizaciones':
        return useCotizacionFields();
      case 'unidades':
        return useUnidadFields();
      default:
        return [];
    }
  }, [resourceType, selectedStatus]);
  
  return fields;
}

export function useDesarrolloFields(): FieldDefinition[] {
  return [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      tab: 'general',
      placeholder: 'Nombre del desarrollo',
    },
    {
      name: 'ubicacion',
      label: 'Ubicación',
      type: 'text',
      tab: 'general',
      placeholder: 'Ubicación del desarrollo',
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      tab: 'general',
      placeholder: 'Descripción del desarrollo',
    },
    {
      name: 'imagen_url',
      label: 'Imagen',
      type: 'image-upload',
      tab: 'general',
      bucket: 'desarrollo-images',
      folder: 'general'
    },
    {
      name: 'total_unidades',
      label: 'Total de Unidades',
      type: 'number',
      tab: 'general',
      placeholder: 'Total de unidades',
    },
    {
      name: 'unidades_disponibles',
      label: 'Unidades Disponibles',
      type: 'number',
      tab: 'general',
      placeholder: 'Unidades disponibles',
    },
    {
      name: 'avance_porcentaje',
      label: 'Porcentaje de Avance',
      type: 'number',
      tab: 'financiero',
      placeholder: 'Porcentaje de avance',
    },
    {
      name: 'moneda',
      label: 'Moneda',
      type: 'select',
      tab: 'financiero',
      options: [
        { label: 'MXN', value: 'MXN' },
        { label: 'USD', value: 'USD' },
      ],
    },
    {
      name: 'comision_operador',
      label: 'Comisión del Operador (%)',
      type: 'number',
      tab: 'financiero',
      placeholder: 'Comisión del operador',
    },
    {
      name: 'mantenimiento_valor',
      label: 'Mantenimiento',
      type: 'number',
      tab: 'financiero',
      placeholder: 'Valor de mantenimiento',
    },
    {
      name: 'es_mantenimiento_porcentaje',
      label: '¿Mantenimiento es porcentaje?',
      type: 'switch',
      tab: 'financiero',
    },
    {
      name: 'gastos_fijos',
      label: 'Gastos Fijos',
      type: 'number',
      tab: 'financiero',
      placeholder: 'Gastos fijos',
    },
    {
      name: 'es_gastos_fijos_porcentaje',
      label: '¿Gastos fijos son porcentaje?',
      type: 'switch',
      tab: 'financiero',
    },
    {
      name: 'gastos_variables',
      label: 'Gastos Variables (%)',
      type: 'number',
      tab: 'financiero',
      placeholder: 'Gastos variables',
    },
    {
      name: 'es_gastos_variables_porcentaje',
      label: '¿Gastos variables son porcentaje?',
      type: 'switch',
      tab: 'financiero',
    },
    {
      name: 'impuestos',
      label: 'Impuestos (%)',
      type: 'number',
      tab: 'financiero',
      placeholder: 'Impuestos',
    },
    {
      name: 'es_impuestos_porcentaje',
      label: '¿Impuestos son porcentaje?',
      type: 'switch',
      tab: 'financiero',
    },
    {
      name: 'adr_base',
      label: 'ADR Base',
      type: 'number',
      tab: 'financiero',
      placeholder: 'ADR Base',
    },
    {
      name: 'ocupacion_anual',
      label: 'Ocupación Anual (%)',
      type: 'number',
      tab: 'financiero',
      placeholder: 'Ocupación Anual',
    },
    {
      name: 'amenidades',
      label: 'Amenidades',
      type: 'amenities',
      tab: 'amenities',
    }
  ];
}

export function usePrototipoFields(): FieldDefinition[] {
  return [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      tab: 'general',
      placeholder: 'Nombre del prototipo',
    },
    {
      name: 'desarrollo_id',
      label: 'Desarrollo',
      type: 'text',
      tab: 'general',
      readOnly: true,
      placeholder: 'ID del desarrollo',
    },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'text',
      tab: 'general',
      placeholder: 'Tipo de prototipo',
    },
    {
      name: 'precio',
      label: 'Precio',
      type: 'number',
      tab: 'general',
      formatCurrency: true,
    },
    {
      name: 'superficie',
      label: 'Superficie (m2)',
      type: 'number',
      tab: 'general',
      placeholder: 'Superficie en metros cuadrados',
    },
    {
      name: 'habitaciones',
      label: 'Habitaciones',
      type: 'number',
      tab: 'general',
      placeholder: 'Número de habitaciones',
    },
    {
      name: 'baños',
      label: 'Baños',
      type: 'number',
      tab: 'general',
      placeholder: 'Número de baños',
    },
    {
      name: 'estacionamientos',
      label: 'Estacionamientos',
      type: 'number',
      tab: 'general',
      placeholder: 'Número de estacionamientos',
    },
    {
      name: 'total_unidades',
      label: 'Total de Unidades',
      type: 'number',
      tab: 'general',
      placeholder: 'Total de unidades',
    },
    {
      name: 'unidades_disponibles',
      label: 'Unidades Disponibles',
      type: 'number',
      tab: 'general',
      placeholder: 'Unidades disponibles',
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'textarea',
      tab: 'general',
      placeholder: 'Descripción del prototipo',
    },
    {
      name: 'imagen_url',
      label: 'Imagen',
      type: 'image-upload',
      tab: 'general',
      bucket: 'prototipo-images',
      folder: 'general'
    },
  ];
}

export function useLeadFields(selectedStatus?: string): FieldDefinition[] {
  return [
    {
      name: 'nombre',
      label: 'Nombre',
      type: 'text',
      tab: 'general',
      placeholder: 'Nombre del lead',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      tab: 'general',
      placeholder: 'Email del lead',
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'text',
      tab: 'general',
      placeholder: 'Teléfono del lead',
    },
    {
      name: 'origen',
      label: 'Origen',
      type: 'text',
      tab: 'general',
      placeholder: 'Origen del lead',
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      tab: 'general',
      options: [
        { label: 'Nuevo', value: 'nuevo' },
        { label: 'Contactado', value: 'contactado' },
        { label: 'Interesado', value: 'interesado' },
        { label: 'Calificado', value: 'calificado' },
        { label: 'Descartado', value: 'descartado' },
      ],
    },
    {
      name: 'subestado',
      label: 'Subestado',
      type: 'select',
      tab: 'general',
      options: getSubestadosOptions(selectedStatus),
    },
    {
      name: 'agente',
      label: 'Agente',
      type: 'text',
      tab: 'general',
      placeholder: 'Agente asignado',
    },
    {
      name: 'interes_en',
      label: 'Interés en',
      type: 'interest-selector',
      tab: 'general',
      description: '¿En qué está interesado el lead?',
    },
    {
      name: 'notas',
      label: 'Notas',
      type: 'textarea',
      tab: 'general',
      placeholder: 'Notas adicionales',
    },
    {
      name: 'ultimo_contacto',
      label: 'Último Contacto',
      type: 'date',
      tab: 'general',
    },
  ];
}

const getSubestadosOptions = (estado?: string) => {
  switch (estado) {
    case 'nuevo':
      return [
        { label: 'Sin Contactar', value: 'sin_contactar' },
        { label: 'Contactado', value: 'contactado' },
      ];
    case 'contactado':
      return [
        { label: 'Interesado', value: 'interesado' },
        { label: 'No Interesado', value: 'no_interesado' },
      ];
    case 'interesado':
      return [
        { label: 'Calificado', value: 'calificado' },
        { label: 'No Calificado', value: 'no_calificado' },
      ];
    case 'calificado':
      return [
        { label: 'Cita Agendada', value: 'cita_agendada' },
        { label: 'Cita Cumplida', value: 'cita_cumplida' },
      ];
    case 'descartado':
      return [
        { label: 'Falta de Presupuesto', value: 'falta_de_presupuesto' },
        { label: 'No Responde', value: 'no_responde' },
        { label: 'Otro', value: 'otro' },
      ];
    default:
      return [];
  }
};

export function useCotizacionFields(): FieldDefinition[] {
  return [
    {
      name: 'lead_id',
      label: 'Lead',
      type: 'text',
      tab: 'general',
      readOnly: true,
      placeholder: 'ID del lead',
    },
    {
      name: 'desarrollo_id',
      label: 'Desarrollo',
      type: 'text',
      tab: 'general',
      readOnly: true,
      placeholder: 'ID del desarrollo',
    },
    {
      name: 'prototipo_id',
      label: 'Prototipo',
      type: 'text',
      tab: 'general',
      readOnly: true,
      placeholder: 'ID del prototipo',
    },
    {
      name: 'monto_anticipo',
      label: 'Monto de Anticipo',
      type: 'number',
      tab: 'general',
      placeholder: 'Monto de anticipo',
    },
    {
      name: 'numero_pagos',
      label: 'Número de Pagos',
      type: 'number',
      tab: 'general',
      placeholder: 'Número de pagos',
    },
    {
      name: 'usar_finiquito',
      label: 'Usar Finiquito',
      type: 'switch',
      tab: 'general',
    },
    {
      name: 'notas',
      label: 'Notas',
      type: 'textarea',
      tab: 'general',
      placeholder: 'Notas adicionales',
    },
  ];
}

export function useUnidadFields(): FieldDefinition[] {
  return [
    {
      name: 'prototipo_id',
      label: 'Prototipo',
      type: 'text',
      tab: 'general',
      readOnly: true,
      placeholder: 'ID del prototipo',
    },
    {
      name: 'numero',
      label: 'Número de Unidad',
      type: 'text',
      tab: 'general',
      placeholder: 'Número de unidad',
    },
    {
      name: 'nivel',
      label: 'Nivel',
      type: 'text',
      tab: 'general',
      placeholder: 'Nivel de la unidad',
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      tab: 'general',
      options: [
        { label: 'Disponible', value: 'disponible' },
        { label: 'Reservada', value: 'reservada' },
        { label: 'Vendida', value: 'vendida' },
        { label: 'Rentada', value: 'rentada' },
        { label: 'Mantenimiento', value: 'mantenimiento' },
      ],
    },
  ];
}
