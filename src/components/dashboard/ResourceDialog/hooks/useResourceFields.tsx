
import { useState, useEffect } from 'react';
import { FieldDefinition, ResourceType } from '../types';

// Helper function to ensure field types match the allowed values
const validateFieldType = (type: string): FieldDefinition['type'] => {
  const validTypes: FieldDefinition['type'][] = [
    'text', 'number', 'textarea', 'select', 'switch', 
    'date', 'image', 'select-lead', 'select-desarrollo', 
    'select-prototipo', 'email', 'upload', 'amenities'
  ];
  
  return validTypes.includes(type as any) 
    ? (type as FieldDefinition['type']) 
    : 'text'; // Default to 'text' if invalid
};

export function useResourceFields(resourceType: ResourceType) {
  const [fields, setFields] = useState<FieldDefinition[]>([]);

  useEffect(() => {
    if (resourceType === 'prototipos') {
      setFields([
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: [
          { value: 'apartamento', label: 'Apartamento' },
          { value: 'casa', label: 'Casa' },
          { value: 'villa', label: 'Villa' },
          { value: 'lote', label: 'Lote' },
          { value: 'local', label: 'Local comercial' },
        ]},
        { name: 'precio', label: 'Precio', type: 'number' },
        { name: 'superficie', label: 'Superficie (m²)', type: 'number' },
        { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
        { name: 'baños', label: 'Baños', type: 'number' },
        { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' },
        { name: 'total_unidades', label: 'Total de unidades', type: 'number' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
        { name: 'imagen_url', label: 'Imagen principal', type: 'image' },
        { name: 'caracteristicas', label: 'Características adicionales', type: 'textarea', 
          tab: 'Características' },
        { name: 'disponibilidad', label: 'Disponibilidad', type: 'text', 
          tab: 'Características' },
        { name: 'fecha_entrega', label: 'Fecha estimada de entrega', type: 'date', 
          tab: 'Características' },
        { name: 'materiales', label: 'Materiales de construcción', type: 'textarea', 
          tab: 'Características' },
        { name: 'ubicacion_interna', label: 'Ubicación dentro del desarrollo', type: 'text', 
          tab: 'Características' },
      ]);
    } else if (resourceType === 'unidades') {
      setFields([
        { name: 'numero', label: 'Número', type: 'text' },
        { name: 'nivel', label: 'Nivel/Piso', type: 'text' },
        { name: 'estado', label: 'Estado', type: 'select', options: [
          { value: 'disponible', label: 'Disponible' },
          { value: 'apartado', label: 'Apartado' },
          { value: 'en_proceso', label: 'En proceso de venta' },
          { value: 'en_pagos', label: 'En pagos' },
          { value: 'vendido', label: 'Vendido' },
        ]},
        { name: 'precio_venta', label: 'Precio de venta', type: 'number' },
        { name: 'comprador_id', label: 'Comprador', type: 'select-lead' },
      ]);
    } else if (resourceType === 'leads') {
      setFields([
        { name: 'nombre', label: 'Nombre', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'telefono', label: 'Teléfono', type: 'text' },
        { name: 'interes_en', label: 'Interés en', type: 'text' },
        { name: 'origen', label: 'Origen', type: 'select', options: [
          { value: 'web', label: 'Sitio Web' },
          { value: 'referido', label: 'Referido' },
          { value: 'redes_sociales', label: 'Redes Sociales' },
          { value: 'evento', label: 'Evento' },
          { value: 'otro', label: 'Otro' },
        ]},
        { name: 'estado', label: 'Estado', type: 'select', options: [
          { value: 'nuevo', label: 'Nuevo' },
          { value: 'en_contacto', label: 'En contacto' },
          { value: 'calificado', label: 'Calificado' },
          { value: 'en_negociacion', label: 'En negociación' },
          { value: 'ganado', label: 'Ganado' },
          { value: 'perdido', label: 'Perdido' },
        ]},
        { name: 'notas', label: 'Notas', type: 'textarea' },
      ]);
    } else if (resourceType === 'cotizaciones') {
      setFields([
        { name: 'lead_id', label: 'Cliente', type: 'select-lead' },
        { name: 'desarrollo_id', label: 'Desarrollo', type: 'select-desarrollo' },
        { name: 'prototipo_id', label: 'Prototipo', type: 'select-prototipo' },
        { name: 'monto_anticipo', label: 'Monto de anticipo', type: 'number' },
        { name: 'numero_pagos', label: 'Número de pagos', type: 'number' },
        { name: 'usar_finiquito', label: 'Usar finiquito', type: 'switch' },
        { name: 'monto_finiquito', label: 'Monto de finiquito', type: 'number' },
        { name: 'notas', label: 'Notas', type: 'textarea' },
      ]);
    }
  }, [resourceType]);

  return fields;
}
