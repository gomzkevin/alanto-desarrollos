
import { useState, useEffect } from 'react';
import { FieldDefinition, ResourceType, FieldType } from '../types';
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
          { name: 'nombre', label: 'Nombre', type: 'text' as FieldType, tab: 'general' },
          { name: 'ubicacion', label: 'Ubicación', type: 'text' as FieldType, tab: 'general' },
          { name: 'total_unidades', label: 'Total Unidades', type: 'number' as FieldType, tab: 'general' },
          { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number' as FieldType, tab: 'general' },
          { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number' as FieldType, tab: 'general' },
          { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' as FieldType, tab: 'general' },
          { name: 'fecha_entrega', label: 'Fecha Entrega', type: 'date' as FieldType, tab: 'general' },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' as FieldType, tab: 'general' },
          { name: 'imagen_url', label: 'Imagen URL', type: 'image-upload' as FieldType, tab: 'media', bucket: 'prototipo-images', folder: 'desarrollos' },
          { name: 'amenidades', label: 'Amenidades', type: 'amenities' as FieldType, tab: 'amenidades' },
          { name: 'moneda', label: 'Moneda', type: 'select' as FieldType, options: [
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' }
            ], tab: 'financiero' 
          },
          { name: 'comision_operador', label: 'Comisión Operador (%)', type: 'number' as FieldType, tab: 'financiero' },
          { name: 'mantenimiento_valor', label: 'Mantenimiento', type: 'number' as FieldType, tab: 'financiero' },
          { name: 'es_mantenimiento_porcentaje', label: 'Mantenimiento es porcentaje', type: 'switch' as FieldType, tab: 'financiero' },
          { name: 'gastos_fijos', label: 'Gastos Fijos', type: 'number' as FieldType, tab: 'financiero' },
          { name: 'es_gastos_fijos_porcentaje', label: 'Gastos Fijos es porcentaje', type: 'switch' as FieldType, tab: 'financiero' },
          { name: 'gastos_variables', label: 'Gastos Variables (%)', type: 'number' as FieldType, tab: 'financiero' },
          { name: 'es_gastos_variables_porcentaje', label: 'Gastos Variables es porcentaje', type: 'switch' as FieldType, tab: 'financiero' },
          { name: 'impuestos', label: 'Impuestos (%)', type: 'number' as FieldType, tab: 'financiero' },
          { name: 'es_impuestos_porcentaje', label: 'Impuestos es porcentaje', type: 'switch' as FieldType, tab: 'financiero' },
          { name: 'adr_base', label: 'ADR Base', type: 'number' as FieldType, tab: 'financiero' },
          { name: 'ocupacion_anual', label: 'Ocupación Anual (%)', type: 'number' as FieldType, tab: 'financiero' },
        ];
        break;

      case 'prototipos':
        fieldDefinitions = [
          { name: 'nombre', label: 'Nombre', type: 'text' as FieldType, tab: 'general' },
          { name: 'tipo', label: 'Tipo', type: 'select' as FieldType, options: tiposPropiedad, tab: 'general' },
          { name: 'precio', label: 'Precio', type: 'number' as FieldType, tab: 'general' },
          { name: 'superficie', label: 'Superficie (m²)', type: 'number' as FieldType, tab: 'general' },
          { name: 'habitaciones', label: 'Habitaciones', type: 'number' as FieldType, tab: 'detalles' },
          { name: 'baños', label: 'Baños', type: 'number' as FieldType, tab: 'detalles' },
          { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' as FieldType, tab: 'detalles' },
          { name: 'total_unidades', label: 'Total Unidades', type: 'number' as FieldType, tab: 'detalles' },
          { name: 'unidades_vendidas', label: 'Unidades Vendidas', type: 'number' as FieldType, tab: 'detalles' },
          { name: 'unidades_con_anticipo', label: 'Unidades con Anticipo', type: 'number' as FieldType, tab: 'detalles' },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' as FieldType, tab: 'detalles' },
          { name: 'imagen_url', label: 'Imagen', type: 'image-upload' as FieldType, tab: 'media', bucket: 'prototipo-images', folder: 'prototipos' },
        ];
        break;

      case 'leads':
        fieldDefinitions = [
          { name: 'nombre', label: 'Nombre', type: 'text' as FieldType, tab: 'general' },
          { name: 'email', label: 'Email', type: 'email' as FieldType, tab: 'general' },
          { name: 'telefono', label: 'Teléfono', type: 'text' as FieldType, tab: 'general' },
          { name: 'agente', label: 'Agente', type: 'text' as FieldType, tab: 'general' },
          { name: 'estado', label: 'Estado', type: 'select' as FieldType, options: statusOptions, tab: 'seguimiento' },
          { name: 'subestado', label: 'Subestado', type: 'select' as FieldType, options: [], tab: 'seguimiento' },
          { name: 'origen', label: 'Origen', type: 'select' as FieldType, options: originOptions, tab: 'seguimiento' },
          { name: 'interes_en', label: 'Interés en', type: 'interest-selector' as FieldType, tab: 'seguimiento' },
          { name: 'ultimo_contacto', label: 'Última fecha de contacto', type: 'date' as FieldType, tab: 'seguimiento' },
          { name: 'notas', label: 'Notas', type: 'textarea' as FieldType, tab: 'seguimiento' },
        ];
        break;

      case 'cotizaciones':
        fieldDefinitions = [
          { name: 'lead_id', label: 'Cliente', type: 'select-lead' as FieldType, tab: 'general' },
          { name: 'desarrollo_id', label: 'Desarrollo', type: 'select' as FieldType, options: [], tab: 'general' },
          { name: 'prototipo_id', label: 'Prototipo', type: 'select' as FieldType, options: [], tab: 'general' },
          { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch' as FieldType, tab: 'financiamiento' },
          { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number' as FieldType, tab: 'financiamiento' },
          { name: 'numero_pagos', label: 'Número de Pagos', type: 'number' as FieldType, tab: 'financiamiento' },
          { name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number' as FieldType, tab: 'financiamiento' },
          { name: 'notas', label: 'Notas', type: 'textarea' as FieldType, tab: 'adicional' },
        ];
        break;

      case 'unidades':
        fieldDefinitions = [
          { name: 'numero', label: 'Número/Identificador', type: 'text' as FieldType },
          { name: 'estado', label: 'Estado', type: 'select' as FieldType, options: [
            { value: 'disponible', label: 'Disponible' },
            { value: 'reservada', label: 'Reservada' },
            { value: 'vendida', label: 'Vendida' }
          ]},
          { name: 'precio_final', label: 'Precio Final', type: 'number' as FieldType },
          { name: 'comprador_id', label: 'Comprador', type: 'select-lead' as FieldType },
          { name: 'fecha_reserva', label: 'Fecha de Reserva', type: 'date' as FieldType },
          { name: 'fecha_venta', label: 'Fecha de Venta', type: 'date' as FieldType },
          { name: 'notas', label: 'Notas', type: 'textarea' as FieldType },
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
