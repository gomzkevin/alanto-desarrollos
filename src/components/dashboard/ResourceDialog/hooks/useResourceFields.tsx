
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FieldDefinition, ResourceType, FieldType } from '../types';
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
            { name: 'nombre', label: 'Nombre', type: 'text' as FieldType, required: true },
            { name: 'ubicacion', label: 'Ubicación', type: 'text' as FieldType, required: true },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' as FieldType, required: true },
            { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number' as FieldType, required: true },
            { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number' as FieldType },
            { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' as FieldType },
            { name: 'fecha_entrega', label: 'Fecha Entrega', type: 'date' as FieldType },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' as FieldType },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload' as FieldType },
            { name: 'amenidades', label: 'Amenidades', type: 'amenities' as FieldType },
            // Campos financieros
            { name: 'moneda', label: 'Moneda', type: 'select' as FieldType, options: [
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' }
            ]},
            { name: 'comision_operador', label: 'Comisión Operador (%)', type: 'number' as FieldType },
            { name: 'mantenimiento_valor', label: 'Mantenimiento', type: 'number' as FieldType },
            { name: 'es_mantenimiento_porcentaje', label: 'Mantenimiento es porcentaje', type: 'switch' as FieldType },
            { name: 'gastos_fijos', label: 'Gastos Fijos', type: 'number' as FieldType },
            { name: 'es_gastos_fijos_porcentaje', label: 'Gastos Fijos es porcentaje', type: 'switch' as FieldType },
            { name: 'gastos_variables', label: 'Gastos Variables', type: 'number' as FieldType },
            { name: 'es_gastos_variables_porcentaje', label: 'Gastos Variables es porcentaje', type: 'switch' as FieldType },
            { name: 'impuestos', label: 'Impuestos', type: 'number' as FieldType },
            { name: 'es_impuestos_porcentaje', label: 'Impuestos es porcentaje', type: 'switch' as FieldType },
            { name: 'adr_base', label: 'ADR Base', type: 'number' as FieldType },
            { name: 'ocupacion_anual', label: 'Ocupación Anual (%)', type: 'number' as FieldType },
          ];
        case 'prototipos':
          return [
            { name: 'desarrollo_id', label: 'Desarrollo', type: 'select' as FieldType, options: desarrollos.map(d => ({ value: d.id, label: d.nombre })), required: true },
            { name: 'nombre', label: 'Nombre', type: 'text' as FieldType, required: true },
            { name: 'tipo', label: 'Tipo', type: 'select' as FieldType, options: [
              { value: 'apartamento', label: 'Apartamento' },
              { value: 'casa', label: 'Casa' },
              { value: 'villa', label: 'Villa' },
              { value: 'terreno', label: 'Terreno' },
              { value: 'local', label: 'Local comercial' },
              { value: 'oficina', label: 'Oficina' },
              { value: 'otro', label: 'Otro' },
            ], required: true },
            { name: 'precio', label: 'Precio', type: 'number' as FieldType, required: true },
            { name: 'superficie', label: 'Superficie (m²)', type: 'number' as FieldType },
            { name: 'habitaciones', label: 'Habitaciones', type: 'number' as FieldType },
            { name: 'baños', label: 'Baños', type: 'number' as FieldType },
            { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' as FieldType },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' as FieldType, required: true },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' as FieldType },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload' as FieldType },
          ];
        case 'leads':
          return [
            { name: 'nombre', label: 'Nombre', type: 'text' as FieldType, required: true },
            { name: 'email', label: 'Email', type: 'email' as FieldType },
            { name: 'telefono', label: 'Teléfono', type: 'text' as FieldType },
            { name: 'estado', label: 'Estado', type: 'select' as FieldType, options: [
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
            { name: 'subestado', label: 'Subestado', type: 'select' as FieldType, options: [] },
            { name: 'origen', label: 'Origen', type: 'select' as FieldType, options: [
              { value: 'sitio_web', label: 'Sitio Web' },
              { value: 'referencia', label: 'Referencia' },
              { value: 'redes_sociales', label: 'Redes Sociales' },
              { value: 'llamada', label: 'Llamada' },
              { value: 'email', label: 'Email' },
              { value: 'visita_directa', label: 'Visita Directa' },
              { value: 'otro', label: 'Otro' }
            ] },
            { name: 'interes_en', label: 'Interés en', type: 'text' as FieldType },
            { name: 'ultimo_contacto', label: 'Último contacto', type: 'date' as FieldType },
            { name: 'notas', label: 'Notas', type: 'textarea' as FieldType },
          ];
        case 'cotizaciones':
          return [
            // Si no se ha pasado un lead_id, mostrar selector de cliente
            { name: 'lead_id', label: 'Cliente', type: 'select-lead' as FieldType, required: true },
            // Si no se ha pasado un desarrollo_id, mostrar selector de desarrollo
            { name: 'desarrollo_id', label: 'Desarrollo', type: 'select' as FieldType, options: desarrollos.map(d => ({ value: d.id, label: d.nombre })), required: true },
            // Prototipos filtrados por desarrollo seleccionado
            { name: 'prototipo_id', label: 'Prototipo', type: 'select' as FieldType, options: prototipos.map(p => ({ value: p.id, label: p.nombre })), required: true },
            // Opción para especificar finiquito
            { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch' as FieldType },
            // Monto de anticipo
            { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number' as FieldType, required: true },
            // Número de pagos mensuales
            { name: 'numero_pagos', label: 'Número de Pagos', type: 'number' as FieldType, required: true },
            // Monto de finiquito (opcional)
            { name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number' as FieldType },
            // Notas
            { name: 'notas', label: 'Notas', type: 'textarea' as FieldType },
          ];
        case 'unidades':
          return [
            { name: 'numero', label: 'Número/Identificador', type: 'text' as FieldType, required: true },
            { name: 'nivel', label: 'Nivel/Piso', type: 'text' as FieldType },
            { name: 'precio_venta', label: 'Precio', type: 'number' as FieldType, required: true },
            { name: 'estado', label: 'Estado', type: 'select' as FieldType, options: [
              { value: 'disponible', label: 'Disponible' },
              { value: 'apartado', label: 'Apartado' },
              { value: 'en_proceso', label: 'En Proceso' },
              { value: 'vendido', label: 'Vendido' }
            ], required: true },
            { name: 'comprador_id', label: 'Comprador', type: 'select-lead' as FieldType },
            { name: 'fecha_venta', label: 'Fecha de Venta', type: 'date' as FieldType },
          ];
        default:
          return [];
      }
    };
    
    setFields(getFieldsForResourceType());
  }, [resourceType, desarrollos, prototipos, selectedDesarrolloId]);

  return fields;
};
