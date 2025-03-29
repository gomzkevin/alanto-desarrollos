
import { useState, useEffect } from 'react';
import { FieldDefinition, ResourceType } from '../types';
import { useDesarrollos } from '@/hooks/desarrollos';

// Mock categories and statuses until the real hooks are created
const useMockCategories = () => ({ categorias: [] });
const useMockSubestados = () => ({ subestados: [] });
const useMockLeadAgenteOptions = () => ({ leadAgenteOptions: [] });

export const useResourceFields = (resourceType: ResourceType, selectedStatus?: string) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const { desarrollos } = useDesarrollos();
  
  // Use mock data temporarily
  const { categorias: intereses } = useMockCategories();
  const { subestados } = useMockSubestados();
  const { leadAgenteOptions } = useMockLeadAgenteOptions();

  useEffect(() => {
    let newFields: FieldDefinition[] = [];

    switch (resourceType) {
      case 'desarrollos':
        newFields = [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'ubicacion', label: 'Ubicación', type: 'text', required: true },
          { name: 'total_unidades', label: 'Total de Unidades', type: 'number', required: true },
          { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number', required: true },
          { name: 'avance_porcentaje', label: 'Porcentaje de Avance', type: 'number' },
          { name: 'fecha_inicio', label: 'Fecha de Inicio', type: 'date' },
          { name: 'fecha_entrega', label: 'Fecha de Entrega', type: 'date' },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          { name: 'imagen_url', label: 'Imagen URL', type: 'image-upload' },
          { name: 'moneda', label: 'Moneda', type: 'select', options: [{ label: 'MXN', value: 'MXN' }, { label: 'USD', value: 'USD' }] },
        ];
        break;
      case 'prototipos':
        newFields = [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          {
            name: 'desarrollo_id',
            label: 'Desarrollo',
            type: 'select',
            options: desarrollos.map(d => ({ label: d.nombre, value: d.id })),
            required: true
          },
          { name: 'tipo', label: 'Tipo', type: 'text', required: true },
          { name: 'precio', label: 'Precio', type: 'number', required: true },
          { name: 'superficie', label: 'Superficie (m2)', type: 'number' },
          { name: 'habitaciones', label: 'Habitaciones', type: 'number' },
          { name: 'baños', label: 'Baños', type: 'number' },
          { name: 'estacionamientos', label: 'Estacionamientos', type: 'number' },
          { name: 'total_unidades', label: 'Total de Unidades', type: 'number', required: true },
          { name: 'unidades_disponibles', label: 'Unidades Disponibles', type: 'number', required: true },
          { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          { name: 'imagen_url', label: 'Imagen URL', type: 'image-upload' },
        ];
        break;
      case 'leads':
        newFields = [
          { name: 'nombre', label: 'Nombre', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'telefono', label: 'Teléfono', type: 'text' },
          { name: 'origen', label: 'Origen', type: 'text' },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: LEAD_ESTADOS
          },
          {
            name: 'subestado',
            label: 'Subestado',
            type: 'select',
            options: subestados
          },
          {
            name: 'agente',
            label: 'Agente',
            type: 'select',
            options: leadAgenteOptions
          },
          {
            name: 'interes_en',
            label: 'Interés en',
            type: 'interest-selector',
            options: intereses?.map(interes => ({ label: interes.nombre, value: interes.id })) || []
          },
          { name: 'notas', label: 'Notas', type: 'textarea' },
          { name: 'ultimo_contacto', label: 'Último Contacto', type: 'date' },
        ];
        break;
      case 'cotizaciones':
        newFields = [
          { name: 'lead_id', label: 'Lead', type: 'select-lead', required: true },
          {
            name: 'desarrollo_id',
            label: 'Desarrollo',
            type: 'select',
            options: desarrollos.map(d => ({ label: d.nombre, value: d.id })),
            required: true
          },
          { name: 'prototipo_id', label: 'Prototipo', type: 'text', required: true },
          { name: 'monto_anticipo', label: 'Monto de Anticipo', type: 'number', required: true },
          { name: 'numero_pagos', label: 'Número de Pagos', type: 'number', required: true },
          { name: 'usar_finiquito', label: 'Usar Finiquito', type: 'switch' },
          { name: 'monto_finiquito', label: 'Monto de Finiquito', type: 'number' },
          { name: 'notas', label: 'Notas', type: 'textarea' },
        ];
        break;
      case 'unidades':
        newFields = [
          { name: 'prototipo_id', label: 'Prototipo', type: 'text', required: true },
          { name: 'numero', label: 'Número', type: 'text', required: true },
          { name: 'nivel', label: 'Nivel', type: 'text' },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { label: 'Disponible', value: 'disponible' },
              { label: 'Apartado', value: 'apartado' },
              { label: 'En Proceso', value: 'en_proceso' },
              { label: 'Vendido', value: 'vendido' },
            ]
          },
        ];
        break;
      default:
        newFields = [];
        break;
    }

    setFields(newFields);
  }, [resourceType, intereses, subestados, leadAgenteOptions, desarrollos]);

  return fields;
};

const LEAD_ESTADOS = [
  { label: 'Nuevo', value: 'nuevo' },
  { label: 'Activo', value: 'activo' },
  { label: 'En Proceso', value: 'en_proceso' },
  { label: 'Cerrado', value: 'cerrado' },
  { label: 'Descartado', value: 'descartado' },
];

export default useResourceFields;
