
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FieldDefinition, ResourceType } from '../types';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

export const useResourceFields = (resourceType: ResourceType, selectedDesarrolloId?: string) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ 
    desarrolloId: selectedDesarrolloId 
  });
  
  useEffect(() => {
    const getFieldsForResourceType = () => {
      switch (resourceType) {
        case 'desarrollos':
          return [
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'ubicacion', label: 'Ubicación', type: 'text', required: true },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number', required: true },
            { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number', required: true },
            { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number' },
            { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
            { name: 'fecha_entrega', label: 'Fecha Entrega', type: 'date' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload' },
            { name: 'amenidades', label: 'Amenidades', type: 'amenities' },
            // Campos financieros
            { name: 'moneda', label: 'Moneda', type: 'select', options: [
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' }
            ]},
            { name: 'comision_operador', label: 'Comisión Operador (%)', type: 'number' },
            { name: 'mantenimiento_valor', label: 'Mantenimiento', type: 'number' },
            { name: 'es_mantenimiento_porcentaje', label: 'Mantenimiento es porcentaje', type: 'switch' },
            { name: 'gastos_fijos', label: 'Gastos Fijos', type: 'number' },
            { name: 'es_gastos_fijos_porcentaje', label: 'Gastos Fijos es porcentaje', type: 'switch' },
            { name: 'gastos_variables', label: 'Gastos Variables', type: 'number' },
            { name: 'es_gastos_variables_porcentaje', label: 'Gastos Variables es porcentaje', type: 'switch' },
            { name: 'impuestos', label: 'Impuestos', type: 'number' },
            { name: 'es_impuestos_porcentaje', label: 'Impuestos es porcentaje', type: 'switch' },
            { name: 'adr_base', label: 'ADR Base', type: 'number' },
            { name: 'ocupacion_anual', label: 'Ocupación Anual (%)', type: 'number' },
          ];
        case 'prototipos':
          return [
            { name: 'desarrollo_id', label: 'Desarrollo', type: 'select', options: desarrollos.map(d => ({ value: d.id, label: d.nombre })), required: true },
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'tipo', label: 'Tipo', type: 'select', options: [
              { value: 'apartamento', label: 'Apartamento' },
              { value: 'casa', label: 'Casa' },
              { value: 'villa', label: 'Villa' },
              { value: 'terreno', label: 'Terreno' },
              { value: 'local', label: 'Local comercial' },
              { value: 'oficina', label: 'Oficina' },
              { value: 'otro', label: 'Otro' },
            ], required: true },
            { name: 'precio', label: 'Precio', type: 'number', required: true },
            { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
            { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
            { name: 'baños', label: 'Baños', type: 'number' },
            { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number', required: true },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload' },
          ];
        case 'leads':
          return [
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'estado', label: 'Estado', type: 'select', options: [
              { value: 'nuevo', label: 'Nuevo' },
              { value: 'contactado', label: 'Contactado' },
              { value: 'interesado', label: 'Interesado' },
              { value: 'visita_programada', label: 'Visita Programada' },
              { value: 'visita_realizada', label: 'Visita Realizada' },
              { value: 'cotizacion', label: 'Cotización' },
              { value: 'negociacion', label: 'Negociación' },
              { value: 'apartado', label: 'Apartado' },
              { value: 'ganado', label: 'Ganado' },
              { value: 'perdido', label: 'Perdido' },
              { value: 'inactivo', label: 'Inactivo' }
            ], required: true },
            { name: 'subestado', label: 'Subestado', type: 'select', options: [] },
            { name: 'origen', label: 'Origen', type: 'select', options: [
              { value: 'sitio_web', label: 'Sitio Web' },
              { value: 'referencia', label: 'Referencia' },
              { value: 'redes_sociales', label: 'Redes Sociales' },
              { value: 'llamada', label: 'Llamada' },
              { value: 'email', label: 'Email' },
              { value: 'visita_directa', label: 'Visita Directa' },
              { value: 'otro', label: 'Otro' }
            ] },
            { name: 'interes_en', label: 'Interés en', type: 'text' },
            { name: 'ultimo_contacto', label: 'Último contacto', type: 'date' },
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
        case 'cotizaciones':
          return [
            // Si no se ha pasado un lead_id, mostrar selector de cliente
            { name: 'lead_id', label: 'Cliente', type: 'lead-select', required: true },
            // Si no se ha pasado un desarrollo_id, mostrar selector de desarrollo
            { name: 'desarrollo_id', label: 'Desarrollo', type: 'select', options: desarrollos.map(d => ({ value: d.id, label: d.nombre })), required: true },
            // Prototipos filtrados por desarrollo seleccionado
            { name: 'prototipo_id', label: 'Prototipo', type: 'select', options: prototipos.map(p => ({ value: p.id, label: p.nombre })), required: true },
            // Opción para especificar finiquito
            { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch' },
            // Monto de anticipo
            { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number', required: true },
            // Número de pagos mensuales
            { name: 'numero_pagos', label: 'Número de Pagos', type: 'number', required: true },
            // Monto de finiquito (opcional)
            { name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number' },
            // Notas
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
        case 'unidades':
          return [
            { name: 'numero', label: 'Número/Identificador', type: 'text', required: true },
            { name: 'nivel', label: 'Nivel/Piso', type: 'text' },
            { name: 'precio_venta', label: 'Precio', type: 'number', required: true },
            { name: 'estado', label: 'Estado', type: 'select', options: [
              { value: 'disponible', label: 'Disponible' },
              { value: 'apartado', label: 'Apartado' },
              { value: 'en_proceso', label: 'En Proceso' },
              { value: 'vendido', label: 'Vendido' }
            ], required: true },
            { name: 'comprador_id', label: 'Comprador', type: 'lead-select' },
            { name: 'fecha_venta', label: 'Fecha de Venta', type: 'date' },
          ];
        default:
          return [];
      }
    };
    
    setFields(getFieldsForResourceType());
  }, [resourceType, desarrollos, prototipos, selectedDesarrolloId]);

  return fields;
};
