import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FieldDefinition, ResourceType } from '../types';
import useLeads from '@/hooks/useLeads';

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

export const useResourceFields = (resourceType: ResourceType) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const { leads } = useLeads();
  
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
            { name: 'numero', label: 'Número/Identificador', type: 'text', required: true, description: 'Identificador único de la unidad (ej. "Unidad 101")' },
            { name: 'estado', label: 'Estado', type: 'select', options: ESTADOS_UNIDAD, required: true, description: 'Estado actual de la unidad' },
            { name: 'nivel', label: 'Nivel/Piso', type: 'text', description: 'Piso o nivel donde se encuentra la unidad' },
            { name: 'precio_venta', label: 'Precio de Venta', type: 'number', description: 'Precio de venta de la unidad' },
            { name: 'comprador_id', label: 'Comprador', type: 'select', options: leads.map(lead => ({ value: lead.id, label: lead.nombre })), description: 'Cliente que ha comprado o reservado esta unidad' },
            { name: 'comprador_nombre', label: 'Nombre del Comprador', type: 'text', description: 'Nombre del comprador en caso de no estar registrado como lead' },
            { name: 'vendedor_id', label: 'Vendedor', type: 'select', options: vendedores.map(v => ({ value: v.id, label: v.nombre })), description: 'Agente de ventas asignado a esta unidad' },
            { name: 'fecha_venta', label: 'Fecha de Venta/Apartado', type: 'date', description: 'Fecha en que se realizó la venta o apartado' },
          ];
        case 'desarrollos':
          return [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'ubicacion', label: 'Ubicación', type: 'text' },
            { name: 'total_unidades', label: 'Total Unidades', type: 'number' },
            { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number' },
            { name: 'avance_porcentaje', label: 'Avance (%)', type: 'number' },
            { name: 'fecha_inicio', label: 'Fecha Inicio', type: 'date' },
            { name: 'fecha_entrega', label: 'Fecha Entrega', type: 'date' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'imagen_url', label: 'Imagen', type: 'image-upload', bucket: 'prototipo-images', folder: 'desarrollos' },
            { name: 'amenidades', label: 'Amenidades', type: 'amenities' },
            { name: 'moneda', label: 'Moneda', type: 'select', options: [
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' }
            ] },
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
            { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS_PROPIEDADES },
            { name: 'precio', label: 'Precio', type: 'number' },
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
          return [
            { name: 'nombre', label: 'Nombre', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'agente', label: 'Agente', type: 'text' },
            { name: 'estado', label: 'Estado', type: 'select', options: [] },
            { name: 'subestado', label: 'Subestado', type: 'select', options: [] },
            { name: 'origen', label: 'Origen', type: 'select', options: [] },
            { name: 'interes_en', label: 'Interés en', type: 'text' },
            { name: 'ultimo_contacto', label: 'Última fecha de contacto', type: 'date' },
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
        case 'cotizaciones':
          return [
            { name: 'lead_id', label: 'Lead', type: 'select', options: [] },
            { name: 'desarrollo_id', label: 'Desarrollo', type: 'select', options: [] },
            { name: 'prototipo_id', label: 'Prototipo', type: 'select', options: [] },
            { name: 'usar_finiquito', label: 'Liquidar con finiquito', type: 'switch' },
            { name: 'monto_anticipo', label: 'Monto Anticipo', type: 'number' },
            { name: 'numero_pagos', label: 'Número de Pagos', type: 'number' },
            { name: 'monto_finiquito', label: 'Monto Finiquito', type: 'number' },
            { name: 'notas', label: 'Notas', type: 'textarea' },
          ];
        default:
          return [];
      }
    };

    setFields(getFieldDefinitions());
  }, [resourceType, leads, vendedores]);

  return fields;
};
