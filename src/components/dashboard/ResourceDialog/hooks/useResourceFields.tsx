
import { useState, useEffect } from 'react';
import { FieldDefinition, ResourceType } from '../types';
import useLeads from '@/hooks/useLeads';

export function useResourceFields(resourceType: ResourceType) {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const { statusOptions, originOptions } = useLeads({});

  useEffect(() => {
    const tiposPropiedad = [
      { value: 'apartamento', label: 'Apartamento' },
      { value: 'casa', label: 'Casa' },
      { value: 'villa', label: 'Villa' },
      { value: 'terreno', label: 'Terreno' },
      { value: 'local', label: 'Local comercial' },
      { value: 'oficina', label: 'Oficina' },
      { value: 'otro', label: 'Otro' },
    ];

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
          { name: 'imagen_url', label: 'Imagen URL', type: 'text', tab: 'media' },
          { name: 'amenidades', label: 'Amenidades', type: 'amenities', tab: 'amenidades' },
          { name: 'moneda', label: 'Moneda', type: 'select', options: [
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' }
            ], tab: 'financiero' 
          },
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
          { name: 'nombre', label: 'Nombre', type: 'text' },
          { name: 'tipo', label: 'Tipo', type: 'select', options: tiposPropiedad },
          { name: 'precio', label: 'Precio', type: 'number' },
          { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
          { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
          { name: 'baños', label: 'Baños', type: 'number' },
          { name: 'total_unidades', label: 'Total Unidades', type: 'number' },
          { name: 'unidades_vendidas', label: 'Unidades Vendidas', type: 'number' },
          { name: 'unidades_con_anticipo', label: 'Unidades con Anticipo', type: 'number' },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          { name: 'imagen_url', label: 'Imagen URL', type: 'text' },
        ];
        break;

      case 'leads':
        fieldDefinitions = [
          { name: 'nombre', label: 'Nombre', type: 'text', tab: 'general' },
          { name: 'email', label: 'Email', type: 'email', tab: 'general' },
          { name: 'telefono', label: 'Teléfono', type: 'text', tab: 'general' },
          { name: 'agente', label: 'Agente', type: 'text', tab: 'general' },
          { name: 'estado', label: 'Estado', type: 'select', options: statusOptions, tab: 'seguimiento' },
          { name: 'subestado', label: 'Subestado', type: 'select', options: [], tab: 'seguimiento' },
          { name: 'origen', label: 'Origen', type: 'select', options: originOptions, tab: 'seguimiento' },
          { name: 'interes_en', label: 'Interés en', type: 'interest-selector', tab: 'seguimiento' },
          { name: 'ultimo_contacto', label: 'Última fecha de contacto', type: 'date', tab: 'seguimiento' },
          { name: 'notas', label: 'Notas', type: 'textarea', tab: 'seguimiento' },
        ];
        break;

      case 'cotizaciones':
        fieldDefinitions = [
          { name: 'lead_id', label: 'Cliente', type: 'select-lead', tab: 'general' },
          { name: 'desarrollo_id', label: 'Desarrollo', type: 'select', options: [], tab: 'general' },
          { name: 'prototipo_id', label: 'Prototipo', type: 'select', options: [], tab: 'general' },
          { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch', tab: 'financiamiento' },
          { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number', tab: 'financiamiento' },
          { name: 'numero_pagos', label: 'Número de Pagos', type: 'number', tab: 'financiamiento' },
          { name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number', tab: 'financiamiento' },
          { name: 'notas', label: 'Notas', type: 'textarea', tab: 'adicional' },
        ];
        break;

      case 'unidades':
        fieldDefinitions = [
          { name: 'numero', label: 'Número/Identificador', type: 'text' },
          { name: 'estado', label: 'Estado', type: 'select', options: [
            { value: 'disponible', label: 'Disponible' },
            { value: 'reservada', label: 'Reservada' },
            { value: 'vendida', label: 'Vendida' }
          ]},
          { name: 'precio_final', label: 'Precio Final', type: 'number' },
          { name: 'comprador_id', label: 'Comprador', type: 'select-lead' },
          { name: 'fecha_reserva', label: 'Fecha de Reserva', type: 'date' },
          { name: 'fecha_venta', label: 'Fecha de Venta', type: 'date' },
          { name: 'notas', label: 'Notas', type: 'textarea' },
        ];
        break;

      default:
        fieldDefinitions = [];
        break;
    }

    setFields(fieldDefinitions);
  }, [resourceType, statusOptions, originOptions]);

  return fields;
}
