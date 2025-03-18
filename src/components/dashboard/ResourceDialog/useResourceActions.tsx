
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import useDesarrolloImagenes from '@/hooks/useDesarrolloImagenes';
import { ResourceType, FormValues, PrototipoResource, DesarrolloResource, LeadResource, CotizacionResource } from './types';

interface ClientConfig {
  isExistingClient: boolean;
  newClientData: {
    nombre: string;
    email: string;
    telefono: string;
  };
}

export default function useResourceActions({
  resourceType,
  resourceId,
  desarrolloId,
  onClose,
  onSave,
  onSuccess,
  selectedAmenities,
  clientConfig
}: {
  resourceType: ResourceType;
  resourceId?: string;
  desarrolloId?: string;
  onClose?: () => void;
  onSave?: () => void;
  onSuccess?: () => void;
  selectedAmenities: string[];
  clientConfig?: ClientConfig;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { uploadImage: desarrolloUploadImage } = useDesarrolloImagenes(
    resourceType === 'desarrollos' && resourceId ? resourceId : undefined
  );

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    
    try {
      if (resourceType === 'desarrollos' && resourceId) {
        await desarrolloUploadImage(file);
        toast({
          title: 'Imagen subida',
          description: 'La imagen ha sido subida exitosamente',
        });
        return null; // No direct URL returned for desarrollo images
      } else {
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('desarrollo-images')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('desarrollo-images')
          .getPublicUrl(fileName);
        
        toast({
          title: 'Imagen subida',
          description: 'La imagen ha sido subida exitosamente',
        });
        
        return publicUrlData.publicUrl;
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Error al subir la imagen: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveResource = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      let result;
      
      const dataToSave = { ...values };
      
      if (resourceType === 'prototipos') {
        const prototipoData = dataToSave as PrototipoResource;
        
        if (desarrolloId && !resourceId) {
          prototipoData.desarrollo_id = desarrolloId;
        }
        
        if (prototipoData.total_unidades !== undefined) {
          const total = Number(prototipoData.total_unidades) || 0;
          const vendidas = Number(prototipoData.unidades_vendidas) || 0;
          const anticipos = Number(prototipoData.unidades_con_anticipo) || 0;
          prototipoData.unidades_disponibles = total - vendidas - anticipos;
        }
        
        const { unidades_vendidas, unidades_con_anticipo, ...dataToModify } = prototipoData;
        
        if (!resourceId) {
          result = await supabase
            .from('prototipos')
            .insert({
              nombre: dataToModify.nombre,
              tipo: dataToModify.tipo,
              precio: dataToModify.precio,
              superficie: dataToModify.superficie,
              habitaciones: dataToModify.habitaciones,
              baños: dataToModify.baños,
              estacionamientos: dataToModify.estacionamientos,
              total_unidades: dataToModify.total_unidades,
              unidades_disponibles: dataToModify.unidades_disponibles,
              desarrollo_id: dataToModify.desarrollo_id,
              descripcion: dataToModify.descripcion,
              imagen_url: dataToModify.imagen_url
            });
        } else {
          result = await supabase
            .from('prototipos')
            .update({
              nombre: dataToModify.nombre,
              tipo: dataToModify.tipo,
              precio: dataToModify.precio,
              superficie: dataToModify.superficie,
              habitaciones: dataToModify.habitaciones,
              baños: dataToModify.baños,
              estacionamientos: dataToModify.estacionamientos,
              total_unidades: dataToModify.total_unidades,
              unidades_disponibles: dataToModify.unidades_disponibles,
              desarrollo_id: dataToModify.desarrollo_id,
              descripcion: dataToModify.descripcion,
              imagen_url: dataToModify.imagen_url
            })
            .eq('id', resourceId);
        }
      } else if (resourceType === 'desarrollos') {
        const desarrolloData = dataToSave as DesarrolloResource;
        
        if (desarrolloData.amenidades === undefined) {
          desarrolloData.amenidades = selectedAmenities;
        }
        
        console.log('Saving desarrollo with amenities:', selectedAmenities);
        
        const amenidadesJson = JSON.stringify(selectedAmenities);
        
        if (!resourceId) {
          result = await supabase
            .from('desarrollos')
            .insert({
              nombre: desarrolloData.nombre,
              ubicacion: desarrolloData.ubicacion,
              total_unidades: desarrolloData.total_unidades,
              unidades_disponibles: desarrolloData.unidades_disponibles,
              avance_porcentaje: desarrolloData.avance_porcentaje,
              fecha_inicio: desarrolloData.fecha_inicio,
              fecha_entrega: desarrolloData.fecha_entrega,
              descripcion: desarrolloData.descripcion,
              imagen_url: desarrolloData.imagen_url,
              moneda: desarrolloData.moneda,
              comision_operador: desarrolloData.comision_operador,
              mantenimiento_valor: desarrolloData.mantenimiento_valor,
              es_mantenimiento_porcentaje: desarrolloData.es_mantenimiento_porcentaje,
              gastos_fijos: desarrolloData.gastos_fijos,
              es_gastos_fijos_porcentaje: desarrolloData.es_gastos_fijos_porcentaje,
              gastos_variables: desarrolloData.gastos_variables,
              es_gastos_variables_porcentaje: desarrolloData.es_gastos_variables_porcentaje,
              impuestos: desarrolloData.impuestos,
              es_impuestos_porcentaje: desarrolloData.es_impuestos_porcentaje,
              adr_base: desarrolloData.adr_base,
              ocupacion_anual: desarrolloData.ocupacion_anual,
              amenidades: amenidadesJson,
            });
        } else {
          result = await supabase
            .from('desarrollos')
            .update({
              nombre: desarrolloData.nombre,
              ubicacion: desarrolloData.ubicacion,
              total_unidades: desarrolloData.total_unidades,
              unidades_disponibles: desarrolloData.unidades_disponibles,
              avance_porcentaje: desarrolloData.avance_porcentaje,
              fecha_inicio: desarrolloData.fecha_inicio,
              fecha_entrega: desarrolloData.fecha_entrega,
              descripcion: desarrolloData.descripcion,
              imagen_url: desarrolloData.imagen_url,
              moneda: desarrolloData.moneda,
              comision_operador: desarrolloData.comision_operador,
              mantenimiento_valor: desarrolloData.mantenimiento_valor,
              es_mantenimiento_porcentaje: desarrolloData.es_mantenimiento_porcentaje,
              gastos_fijos: desarrolloData.gastos_fijos,
              es_gastos_fijos_porcentaje: desarrolloData.es_gastos_fijos_porcentaje,
              gastos_variables: desarrolloData.gastos_variables,
              es_gastos_variables_porcentaje: desarrolloData.es_gastos_variables_porcentaje,
              impuestos: desarrolloData.impuestos,
              es_impuestos_porcentaje: desarrolloData.es_impuestos_porcentaje,
              adr_base: desarrolloData.adr_base,
              ocupacion_anual: desarrolloData.ocupacion_anual,
              amenidades: amenidadesJson,
            })
            .eq('id', resourceId);
        }
        
        if (selectedAmenities.length > 0 && resourceId) {
          try {
            const { updateAmenities } = useDesarrolloImagenes(resourceId);
            updateAmenities(selectedAmenities);
          } catch (e) {
            console.error('Error updating amenities:', e);
          }
        }
      } else if (resourceType === 'leads') {
        const leadData = dataToSave as LeadResource;
        
        if (!resourceId) {
          result = await supabase
            .from('leads')
            .insert({
              nombre: leadData.nombre,
              email: leadData.email,
              telefono: leadData.telefono,
              interes_en: leadData.interes_en,
              origen: leadData.origen,
              estado: leadData.estado,
              subestado: leadData.subestado,
              agente: leadData.agente,
              notas: leadData.notas,
              ultimo_contacto: leadData.ultimo_contacto
            });
        } else {
          result = await supabase
            .from('leads')
            .update({
              nombre: leadData.nombre,
              email: leadData.email,
              telefono: leadData.telefono,
              interes_en: leadData.interes_en,
              origen: leadData.origen,
              estado: leadData.estado,
              subestado: leadData.subestado,
              agente: leadData.agente,
              notas: leadData.notas,
              ultimo_contacto: leadData.ultimo_contacto
            })
            .eq('id', resourceId);
        }
      } else if (resourceType === 'cotizaciones') {
        const cotizacionData = dataToSave as CotizacionResource;
        
        if (!resourceId) {
          result = await supabase
            .from('cotizaciones')
            .insert({
              lead_id: cotizacionData.lead_id,
              desarrollo_id: cotizacionData.desarrollo_id,
              prototipo_id: cotizacionData.prototipo_id,
              monto_anticipo: cotizacionData.monto_anticipo,
              numero_pagos: cotizacionData.numero_pagos,
              usar_finiquito: cotizacionData.usar_finiquito,
              monto_finiquito: cotizacionData.monto_finiquito,
              notas: cotizacionData.notas
            });
        } else {
          result = await supabase
            .from('cotizaciones')
            .update({
              lead_id: cotizacionData.lead_id,
              desarrollo_id: cotizacionData.desarrollo_id,
              prototipo_id: cotizacionData.prototipo_id,
              monto_anticipo: cotizacionData.monto_anticipo,
              numero_pagos: cotizacionData.numero_pagos,
              usar_finiquito: cotizacionData.usar_finiquito,
              monto_finiquito: cotizacionData.monto_finiquito,
              notas: cotizacionData.notas
            })
            .eq('id', resourceId);
        }
      }
      
      const { error } = result || { error: null };
      
      if (error) {
        console.error('Error saving resource:', error);
        toast({
          title: 'Error',
          description: `No se pudo guardar: ${error.message}`,
          variant: 'destructive',
        });
        return false;
      } else {
        toast({
          title: 'Éxito',
          description: resourceId 
            ? 'El recurso ha sido actualizado correctamente'
            : 'El recurso ha sido creado correctamente',
        });
        
        if (onClose) onClose();
        if (onSave) onSave();
        if (onSuccess) onSuccess();
        return true;
      }
    } catch (error: any) {
      console.error('Error in saveResource:', error);
      toast({
        title: 'Error',
        description: `Ha ocurrido un error al guardar el recurso: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    uploading,
    handleImageUpload,
    saveResource
  };
}
