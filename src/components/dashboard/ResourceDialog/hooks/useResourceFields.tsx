
import { FieldDefinition } from '../types';
import useLeads from '@/hooks/useLeads';

export function useResourceFields(resourceType: string): FieldDefinition[] {
  const { statusOptions, getSubstatusOptions, originOptions } = useLeads({});
  
  switch (resourceType) {
    case 'desarrollos':
      return [
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'ubicacion', label: 'Ubicación', type: 'text' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
        { name: 'imagen_url', label: 'Imagen', type: 'image' },
        { name: 'total_unidades', label: 'Total de unidades', type: 'number' },
        { name: 'unidades_disponibles', label: 'Unidades disponibles', type: 'number' },
        { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number' },
        { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', tab: 'Fechas' },
        { name: 'fecha_entrega', label: 'Fecha de entrega', type: 'date', tab: 'Fechas' },
        { name: 'moneda', label: 'Moneda', type: 'select', options: [
          { value: 'MXN', label: 'Peso Mexicano (MXN)' },
          { value: 'USD', label: 'Dólar Estadounidense (USD)' },
        ], tab: 'Finanzas' },
        { name: 'comision_operador', label: 'Comisión del operador (%)', type: 'number', tab: 'Finanzas' },
        { name: 'mantenimiento_valor', label: 'Mantenimiento', type: 'number', tab: 'Finanzas' },
        { name: 'es_mantenimiento_porcentaje', label: 'Mantenimiento es porcentaje', type: 'switch', tab: 'Finanzas' },
        { name: 'gastos_fijos', label: 'Gastos fijos', type: 'number', tab: 'Finanzas' },
        { name: 'es_gastos_fijos_porcentaje', label: 'Gastos fijos es porcentaje', type: 'switch', tab: 'Finanzas' },
        { name: 'gastos_variables', label: 'Gastos variables', type: 'number', tab: 'Finanzas' },
        { name: 'es_gastos_variables_porcentaje', label: 'Gastos variables es porcentaje', type: 'switch', tab: 'Finanzas' },
        { name: 'impuestos', label: 'Impuestos', type: 'number', tab: 'Finanzas' },
        { name: 'es_impuestos_porcentaje', label: 'Impuestos es porcentaje', type: 'switch', tab: 'Finanzas' },
        { name: 'adr_base', label: 'ADR Base', type: 'number', tab: 'Rendimiento' },
        { name: 'ocupacion_anual', label: 'Ocupación anual (%)', type: 'number', tab: 'Rendimiento' },
        { name: 'amenidades', label: 'Amenidades', type: 'amenities', tab: 'Amenidades' },
      ];
      
    case 'prototipos':
      return [
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'desarrollo_id', label: 'Desarrollo', type: 'select-desarrollo' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: [
          { value: 'apartamento', label: 'Apartamento' },
          { value: 'casa', label: 'Casa' },
          { value: 'loft', label: 'Loft' },
          { value: 'penthouse', label: 'Penthouse' },
          { value: 'comercial', label: 'Local comercial' },
        ]},
        { name: 'precio', label: 'Precio', type: 'number' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
        { name: 'imagen_url', label: 'Imagen', type: 'image' },
        { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
        { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
        { name: 'baños', label: 'Baños', type: 'number' },
        { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' },
        { name: 'total_unidades', label: 'Total de unidades', type: 'number' },
      ];
      
    case 'unidades':
      return [
        { name: 'prototipo_id', label: 'Prototipo', type: 'select-prototipo' },
        { name: 'numero', label: 'Número', type: 'text' },
        { name: 'nivel', label: 'Nivel', type: 'text' },
        { name: 'estado', label: 'Estado', type: 'select', options: [
          { value: 'disponible', label: 'Disponible' },
          { value: 'apartado', label: 'Apartado' },
          { value: 'en_proceso', label: 'En proceso' },
          { value: 'en_pagos', label: 'En pagos' },
          { value: 'vendido', label: 'Vendido' },
        ]},
        { name: 'comprador_id', label: 'Comprador', type: 'select-lead' },
        { name: 'precio_venta', label: 'Precio de venta', type: 'number' },
        { name: 'fecha_venta', label: 'Fecha de venta', type: 'text' },
      ];
      
    case 'leads':
      // Get the first status option or default to 'nuevo'
      const defaultStatus = statusOptions.length > 0 ? statusOptions[0].value : 'nuevo';
      const substatusOptions = getSubstatusOptions(defaultStatus);
      
      return [
        { 
          name: 'nombre', 
          label: 'Nombre', 
          type: 'text',
          tab: 'Información básica'
        },
        { 
          name: 'email', 
          label: 'Email', 
          type: 'email',
          tab: 'Información básica'
        },
        { 
          name: 'telefono', 
          label: 'Teléfono', 
          type: 'text',
          tab: 'Información básica'
        },
        { 
          name: 'agente', 
          label: 'Agente', 
          type: 'text',
          tab: 'Información básica'
        },
        { 
          name: 'estado', 
          label: 'Estado', 
          type: 'select', 
          options: statusOptions,
          tab: 'Seguimiento'
        },
        { 
          name: 'subestado', 
          label: 'Subestado', 
          type: 'select', 
          options: substatusOptions,
          tab: 'Seguimiento'
        },
        { 
          name: 'origen', 
          label: 'Origen', 
          type: 'select', 
          options: originOptions,
          tab: 'Seguimiento'
        },
        { 
          name: 'interes_en', 
          label: 'Interés en', 
          type: 'interest-selector',
          tab: 'Seguimiento'
        },
        { 
          name: 'ultimo_contacto', 
          label: 'Última fecha de contacto', 
          type: 'date',
          tab: 'Seguimiento'
        },
        { 
          name: 'notas', 
          label: 'Notas', 
          type: 'textarea',
          tab: 'Notas' 
        },
      ];
      
    case 'cotizaciones':
      return [
        { name: 'lead_id', label: 'Cliente', type: 'select-lead' },
        { name: 'desarrollo_id', label: 'Desarrollo', type: 'select-desarrollo' },
        { name: 'prototipo_id', label: 'Prototipo', type: 'select-prototipo' },
        { name: 'monto_anticipo', label: 'Monto de anticipo', type: 'number' },
        { name: 'numero_pagos', label: 'Número de pagos', type: 'number' },
        { name: 'fecha_inicio_pagos', label: 'Fecha de inicio de pagos', type: 'date' },
        { name: 'usar_finiquito', label: 'Usar finiquito', type: 'switch' },
        { name: 'monto_finiquito', label: 'Monto de finiquito', type: 'number' },
        { name: 'fecha_finiquito', label: 'Fecha de finiquito', type: 'date' },
        { name: 'notas', label: 'Notas', type: 'textarea' },
      ];
      
    default:
      return [];
  }
}
