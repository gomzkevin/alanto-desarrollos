
import { useEffect, useState } from 'react';
import { ResourceType, FieldDefinition } from '../types';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

export const useResourceFields = (resourceType: ResourceType, selectedDesarrolloId?: string) => {
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos();
  
  useEffect(() => {
    let resourceFields: FieldDefinition[] = [];
    
    switch (resourceType) {
      case 'desarrollos':
        resourceFields = [
          {
            name: 'nombre',
            label: 'Nombre',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'descripcion',
            label: 'Descripción',
            type: 'textarea',
            tab: 'general'
          },
          {
            name: 'ubicacion',
            label: 'Ubicación',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'disponible',
            label: 'Disponible',
            type: 'switch',
            tab: 'general'
          },
          {
            name: 'imagen_url',
            label: 'Imagen principal',
            type: 'image-upload',
            bucket: 'desarrollo-images',
            folder: 'desarrollos',
            tab: 'imagenes'
          },
          {
            name: 'fecha_inicio',
            label: 'Fecha de inicio',
            type: 'date',
            tab: 'general'
          },
          {
            name: 'fecha_entrega',
            label: 'Fecha de entrega',
            type: 'date',
            tab: 'general'
          },
          {
            name: 'estatus',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'planeacion', label: 'Planeación' },
              { value: 'construccion', label: 'Construcción' },
              { value: 'finalizado', label: 'Finalizado' },
              { value: 'vendido', label: 'Vendido' }
            ],
            tab: 'general'
          },
          {
            name: 'unidades_disponibles',
            label: 'Unidades disponibles',
            type: 'number',
            readOnly: true,
            tab: 'general'
          },
          {
            name: 'total_unidades',
            label: 'Total de unidades',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'amenidades',
            label: 'Amenidades',
            type: 'amenities',
            tab: 'amenidades'
          },
          {
            name: 'tipo_desarrollo',
            label: 'Tipo de desarrollo',
            type: 'select',
            options: [
              { value: 'horizontal', label: 'Horizontal' },
              { value: 'vertical', label: 'Vertical' },
              { value: 'mixto', label: 'Mixto' }
            ],
            tab: 'general'
          }
        ];
        break;
      
      case 'prototipos':
        resourceFields = [
          {
            name: 'nombre',
            label: 'Nombre',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'descripcion',
            label: 'Descripción',
            type: 'textarea',
            tab: 'general'
          },
          {
            name: 'tipo',
            label: 'Tipo',
            type: 'select',
            options: [
              { value: 'casa', label: 'Casa' },
              { value: 'apartamento', label: 'Apartamento' },
              { value: 'duplex', label: 'Dúplex' },
              { value: 'penthouse', label: 'Penthouse' },
              { value: 'loft', label: 'Loft' },
              { value: 'terreno', label: 'Terreno' },
              { value: 'local', label: 'Local comercial' },
              { value: 'oficina', label: 'Oficina' },
              { value: 'bodega', label: 'Bodega' },
              { value: 'otro', label: 'Otro' }
            ],
            tab: 'general'
          },
          {
            name: 'desarrollo_id',
            label: 'Desarrollo',
            type: 'select',
            options: desarrollos.map(desarrollo => ({ 
              value: desarrollo.id, 
              label: desarrollo.nombre 
            })),
            tab: 'general'
          },
          {
            name: 'imagen_url',
            label: 'Imagen',
            type: 'image-upload',
            bucket: 'prototipo-images',
            folder: 'prototipos',
            tab: 'general'
          },
          {
            name: 'precio',
            label: 'Precio',
            type: 'number',
            tab: 'general'
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
            label: 'Total de unidades',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'unidades_disponibles',
            label: 'Unidades disponibles',
            type: 'number',
            readOnly: true,
            tab: 'general'
          },
          {
            name: 'unidades_vendidas',
            label: 'Unidades vendidas',
            type: 'number',
            readOnly: true,
            tab: 'general'
          },
          {
            name: 'unidades_con_anticipo',
            label: 'Unidades con anticipo',
            type: 'number',
            readOnly: true,
            tab: 'general'
          }
        ];
        break;
      
      case 'leads':
        resourceFields = [
          {
            name: 'nombre',
            label: 'Nombre',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'email',
            label: 'Email',
            type: 'email',
            tab: 'general'
          },
          {
            name: 'telefono',
            label: 'Teléfono',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'origen',
            label: 'Origen',
            type: 'select',
            options: [
              { value: 'sitio_web', label: 'Sitio web' },
              { value: 'redes_sociales', label: 'Redes sociales' },
              { value: 'referencia', label: 'Referencia' },
              { value: 'evento', label: 'Evento' },
              { value: 'visita_fisica', label: 'Visita física' },
              { value: 'portal_inmobiliario', label: 'Portal inmobiliario' },
              { value: 'otro', label: 'Otro' }
            ],
            tab: 'general'
          },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'nuevo', label: 'Nuevo' },
              { value: 'seguimiento', label: 'En seguimiento' },
              { value: 'convertido', label: 'Convertido' },
              { value: 'perdido', label: 'Perdido' }
            ],
            tab: 'general'
          },
          {
            name: 'subestado',
            label: 'Sub-estado',
            type: 'select',
            options: [
              { value: 'sin_contactar', label: 'Sin contactar' },
              { value: 'primer_contacto', label: 'Primer contacto' },
              { value: 'requiere_informacion', label: 'Requiere información' },
              { value: 'requiere_visita', label: 'Requiere visita' },
              { value: 'negociacion', label: 'En negociación' },
              { value: 'cotizacion', label: 'Cotización enviada' },
              { value: 'apartado', label: 'Apartado' },
              { value: 'venta', label: 'Venta concretada' },
              { value: 'no_interesado', label: 'No interesado' },
              { value: 'sin_respuesta', label: 'Sin respuesta' },
              { value: 'cambio_opinion', label: 'Cambió de opinión' },
              { value: 'precio_alto', label: 'Precio alto' }
            ],
            tab: 'general'
          },
          {
            name: 'interes_en',
            label: 'Interés en',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'agente',
            label: 'Agente asignado',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'notas',
            label: 'Notas',
            type: 'textarea',
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
            tab: 'general'
          },
          {
            name: 'desarrollo_id',
            label: 'Desarrollo',
            type: 'select',
            options: desarrollos.map(desarrollo => ({ 
              value: desarrollo.id, 
              label: desarrollo.nombre 
            })),
            tab: 'general'
          },
          {
            name: 'prototipo_id',
            label: 'Prototipo',
            type: 'select',
            options: prototipos
              .filter(p => !selectedDesarrolloId || p.desarrollo_id === selectedDesarrolloId)
              .map(prototipo => ({ 
                value: prototipo.id, 
                label: prototipo.nombre 
              })),
            tab: 'general'
          },
          {
            name: 'precio',
            label: 'Precio',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'moneda',
            label: 'Moneda',
            type: 'select',
            options: [
              { value: 'MXN', label: 'Pesos Mexicanos (MXN)' },
              { value: 'USD', label: 'Dólares Americanos (USD)' }
            ],
            tab: 'general'
          },
          {
            name: 'enganche',
            label: 'Enganche',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'fecha_enganche',
            label: 'Fecha de enganche',
            type: 'date',
            tab: 'general'
          },
          {
            name: 'mensualidades',
            label: 'Número de mensualidades',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'importe_mensual',
            label: 'Importe mensual',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'tasa_interes',
            label: 'Tasa de interés anual',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'usar_finiquito',
            label: 'Incluir finiquito',
            type: 'switch',
            tab: 'general'
          },
          {
            name: 'finiquito',
            label: 'Importe de finiquito',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'fecha_finiquito',
            label: 'Fecha de finiquito',
            type: 'date',
            tab: 'general'
          },
          {
            name: 'notas',
            label: 'Notas',
            type: 'textarea',
            tab: 'general'
          },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'borrador', label: 'Borrador' },
              { value: 'enviada', label: 'Enviada' },
              { value: 'aceptada', label: 'Aceptada' },
              { value: 'rechazada', label: 'Rechazada' },
              { value: 'vencida', label: 'Vencida' }
            ],
            tab: 'general'
          }
        ];
        break;
      
      case 'unidades':
        resourceFields = [
          {
            name: 'numero',
            label: 'Número',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'nivel',
            label: 'Nivel',
            type: 'text',
            tab: 'general'
          },
          {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            options: [
              { value: 'disponible', label: 'Disponible' },
              { value: 'apartado', label: 'Apartado' },
              { value: 'en_proceso', label: 'En proceso' },
              { value: 'vendido', label: 'Vendido' }
            ],
            tab: 'general'
          },
          {
            name: 'prototipo_id',
            label: 'Prototipo',
            type: 'select',
            options: prototipos.map(prototipo => ({ 
              value: prototipo.id, 
              label: prototipo.nombre 
            })),
            tab: 'general'
          },
          {
            name: 'comprador_id',
            label: 'Cliente',
            type: 'select-lead',
            tab: 'general'
          },
          {
            name: 'precio_venta',
            label: 'Precio de venta',
            type: 'number',
            tab: 'general'
          },
          {
            name: 'fecha_venta',
            label: 'Fecha de venta',
            type: 'date',
            tab: 'general'
          }
        ];
        break;
      
      default:
        resourceFields = [];
        break;
    }
    
    setFields(resourceFields);
  }, [resourceType, desarrollos, prototipos, selectedDesarrolloId]);
  
  return fields;
};
