
import { useState, useEffect } from 'react';
import { FieldDefinition, ResourceType } from '../types';

export const useResourceFields = (
  resourceType: ResourceType,
  resourceId?: string
) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);

  useEffect(() => {
    const getFields = () => {
      let resourceFields: FieldDefinition[] = [];

      switch (resourceType) {
        case 'desarrollos':
          resourceFields = [
            {
              name: 'nombre',
              label: 'Nombre',
              type: 'text',
              tab: 'general',
              required: true
            },
            {
              name: 'ubicacion',
              label: 'Ubicación',
              type: 'text',
              tab: 'general',
              required: true
            },
            {
              name: 'total_unidades',
              label: 'Total Unidades',
              type: 'number',
              tab: 'general',
              required: true
            },
            {
              name: 'unidades_disponibles',
              label: 'Unidades Disponibles',
              type: 'number',
              tab: 'general',
              readOnly: true, // Mark as read-only
              description: 'Total de unidades con estatus "Disponible"'
            },
            {
              name: 'avance_porcentaje',
              label: 'Avance Comercial (%)',
              type: 'number',
              tab: 'general',
              readOnly: true, // Mark as read-only
              description: 'Porcentaje de unidades vendidas, apartadas o en proceso de pago'
            },
            {
              name: 'descripcion',
              label: 'Descripción',
              type: 'textarea',
              tab: 'general'
            },
            {
              name: 'imagen_url',
              label: 'Imagen URL',
              type: 'image-upload',
              tab: 'general',
              bucket: 'desarrollo-images',
              folder: 'desarrollos'
            },
            {
              name: 'moneda',
              label: 'Moneda',
              type: 'select',
              tab: 'general',
              options: [
                { label: 'MXN', value: 'MXN' },
                { label: 'USD', value: 'USD' }
              ],
              required: true
            },
            {
              name: 'comision_operador',
              label: 'Comisión del Operador (%)',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'mantenimiento_valor',
              label: 'Valor de Mantenimiento',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'es_mantenimiento_porcentaje',
              label: '¿Es porcentaje?',
              type: 'switch',
              tab: 'general'
            },
            {
              name: 'gastos_fijos',
              label: 'Gastos Fijos',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'es_gastos_fijos_porcentaje',
              label: '¿Gastos Fijos en Porcentaje?',
              type: 'switch',
              tab: 'general'
            },
            {
              name: 'gastos_variables',
              label: 'Gastos Variables',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'es_gastos_variables_porcentaje',
              label: '¿Gastos Variables en Porcentaje?',
              type: 'switch',
              tab: 'general'
            },
            {
              name: 'impuestos',
              label: 'Impuestos (%)',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'es_impuestos_porcentaje',
              label: '¿Impuestos en Porcentaje?',
              type: 'switch',
              tab: 'general'
            },
            {
              name: 'adr_base',
              label: 'ADR Base',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'ocupacion_anual',
              label: 'Ocupación Anual (%)',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'amenidades',
              label: 'Amenidades',
              type: 'amenities',
              tab: 'amenities'
            }
          ];
          break;

        case 'prototipos':
          resourceFields = [
            {
              name: 'nombre',
              label: 'Nombre',
              type: 'text',
              tab: 'general',
              required: true
            },
            {
              name: 'tipo',
              label: 'Tipo',
              type: 'select',
              tab: 'general',
              options: [
                { label: 'Apartamento', value: 'apartamento' },
                { label: 'Casa', value: 'casa' },
                { label: 'Villa', value: 'villa' },
                { label: 'Lote', value: 'lote' },
                { label: 'Comercial', value: 'comercial' }
              ],
              required: true
            },
            {
              name: 'precio',
              label: 'Precio',
              type: 'number',
              tab: 'general',
              required: true
            },
            {
              name: 'superficie',
              label: 'Superficie (m²)',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'habitaciones',
              label: 'Habitaciones',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'baños',
              label: 'Baños',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'estacionamientos',
              label: 'Estacionamientos',
              type: 'number',
              tab: 'general'
            },
            {
              name: 'total_unidades',
              label: 'Total Unidades',
              type: 'number',
              tab: 'general',
              required: true
            },
            {
              name: 'unidades_vendidas',
              label: 'Unidades Vendidas',
              type: 'number',
              tab: 'general',
              readOnly: true
            },
            {
              name: 'unidades_con_anticipo',
              label: 'Unidades con Anticipo',
              type: 'number',
              tab: 'general',
              readOnly: true
            },
            {
              name: 'descripcion',
              label: 'Descripción',
              type: 'textarea',
              tab: 'general'
            },
            {
              name: 'imagen_url',
              label: 'Imagen URL',
              type: 'image-upload',
              tab: 'general',
              bucket: 'prototipo-images',
              folder: 'prototipos'
            }
          ];
          break;

        case 'leads':
          resourceFields = [
            {
              name: 'nombre',
              label: 'Nombre',
              type: 'text',
              tab: 'general',
              required: true
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              tab: 'general',
              required: true
            },
            {
              name: 'telefono',
              label: 'Teléfono',
              type: 'text',
              tab: 'general'
            },
            {
              name: 'interes_en',
              label: 'Interesado en',
              type: 'text',
              tab: 'general'
            },
            {
              name: 'origen',
              label: 'Origen',
              type: 'select',
              tab: 'general',
              options: [
                { label: 'Web', value: 'web' },
                { label: 'Referido', value: 'referido' },
                { label: 'Publicidad', value: 'publicidad' }
              ],
              required: true
            },
            {
              name: 'estado',
              label: 'Estado',
              type: 'select',
              tab: 'general',
              options: [
                { label: 'Nuevo', value: 'nuevo' },
                { label: 'Seguimiento', value: 'seguimiento' },
                { label: 'Cotización', value: 'cotizacion' },
                { label: 'Convertido', value: 'convertido' }
              ],
              required: true
            },
            {
              name: 'subestado',
              label: 'Subestado',
              type: 'text',
              tab: 'general'
            },
            {
              name: 'agente',
              label: 'Agente',
              type: 'text',
              tab: 'general'
            },
            {
              name: 'notas',
              label: 'Notas',
              type: 'textarea',
              tab: 'general'
            },
            {
              name: 'ultimo_contacto',
              label: 'Último Contacto',
              type: 'date',
              tab: 'general'
            }
          ];
          break;

        case 'cotizaciones':
          resourceFields = [
            {
              name: 'lead_id',
              label: 'Cliente',
              type: 'select-lead',
              required: true
            },
            {
              name: 'desarrollo_id',
              label: 'Desarrollo',
              type: 'select',
              required: true
            },
            {
              name: 'prototipo_id',
              label: 'Prototipo',
              type: 'select',
              required: true
            },
            {
              name: 'monto_anticipo',
              label: 'Monto de Anticipo',
              type: 'number',
              required: true
            },
            {
              name: 'numero_pagos',
              label: 'Número de Pagos',
              type: 'number',
              required: true
            },
            {
              name: 'usar_finiquito',
              label: 'Usar Finiquito',
              type: 'switch'
            },
            {
              name: 'monto_finiquito',
              label: 'Monto de Finiquito',
              type: 'number'
            },
            {
              name: 'notas',
              label: 'Notas',
              type: 'textarea'
            }
          ];
          break;

        case 'unidades':
          resourceFields = [
            {
              name: 'numero',
              label: 'Número de Unidad',
              type: 'text',
              required: true
            },
            {
              name: 'nivel',
              label: 'Nivel/Piso',
              type: 'text'
            },
            {
              name: 'estado',
              label: 'Estado',
              type: 'select',
              options: [
                { label: 'Disponible', value: 'disponible' },
                { label: 'Apartado', value: 'apartado' },
                { label: 'En Proceso', value: 'en_proceso' },
                { label: 'Vendido', value: 'vendido' }
              ],
              required: true
            },
            {
              name: 'comprador_id',
              label: 'Cliente',
              type: 'select-lead'
            },
            {
              name: 'precio_venta',
              label: 'Precio de Venta',
              type: 'number'
            },
            {
              name: 'fecha_venta',
              label: 'Fecha de Venta',
              type: 'date'
            }
          ];
          break;

        default:
          break;
      }

      setFields(resourceFields);
    };

    getFields();
  }, [resourceType, resourceId]);

  return fields;
};
