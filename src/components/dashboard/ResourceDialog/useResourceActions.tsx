
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import useDesarrolloImagenes from '@/hooks/useDesarrolloImagenes';
import { ResourceType, FormValues, PrototipoResource, DesarrolloResource, LeadResource, CotizacionResource, UnidadResource } from './types';

export default function useResourceActions({
  resourceType,
  resourceId,
  desarrolloId,
  onClose,
  onSave,
  onSuccess,
  selectedAmenities
}: {
  resourceType: ResourceType;
  resourceId?: string;
  desarrolloId?: string;
  onClose?: () => void;
  onSave?: () => void;
  onSuccess?: () => void;
  selectedAmenities: string[];
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { uploadImage } = useDesarrolloImagenes(
    resourceType === 'desarrollos' && resourceId ? resourceId : undefined
  );

  // Helper function to format dates for Supabase
  const formatDate = (date: string | Date | undefined): string | null => {
    if (!date) return null;
    if (date instanceof Date) {
      return date.toISOString();
    }
    return date;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      if (resourceType === 'desarrollos' && resourceId) {
        await uploadImage(file);
        toast({
          title: 'Imagen subida',
          description: 'La imagen ha sido subida exitosamente',
        });
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
            .insert(dataToModify);
        } else {
          result = await supabase
            .from('prototipos')
            .update(dataToModify)
            .eq('id', resourceId);
        }
      } else if (resourceType === 'desarrollos') {
        const desarrolloData = dataToSave as DesarrolloResource;
        
        if (desarrolloData.amenidades === undefined) {
          desarrolloData.amenidades = selectedAmenities;
        }
        
        console.log('Saving desarrollo with amenities:', selectedAmenities);
        
        const amenidadesJson = JSON.stringify(selectedAmenities);
        
        // Format dates for Supabase
        const formattedData = {
          ...desarrolloData,
          fecha_inicio: formatDate(desarrolloData.fecha_inicio),
          fecha_entrega: formatDate(desarrolloData.fecha_entrega),
          amenidades: amenidadesJson
        };
        
        if (!resourceId) {
          result = await supabase
            .from('desarrollos')
            .insert(formattedData);
        } else {
          result = await supabase
            .from('desarrollos')
            .update(formattedData)
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
        
        // Format dates for Supabase
        const formattedData = {
          ...leadData,
          ultimo_contacto: formatDate(leadData.ultimo_contacto),
          fecha_creacion: formatDate(leadData.fecha_creacion)
        };
        
        if (!resourceId) {
          result = await supabase
            .from('leads')
            .insert(formattedData);
        } else {
          result = await supabase
            .from('leads')
            .update(formattedData)
            .eq('id', resourceId);
        }
      } else if (resourceType === 'cotizaciones') {
        const cotizacionData = dataToSave as CotizacionResource;
        
        // Format dates for Supabase
        const formattedData = {
          ...cotizacionData,
          fecha_inicio_pagos: formatDate(cotizacionData.fecha_inicio_pagos),
          fecha_finiquito: formatDate(cotizacionData.fecha_finiquito)
        };
        
        if (!resourceId) {
          result = await supabase
            .from('cotizaciones')
            .insert(formattedData);
        } else {
          result = await supabase
            .from('cotizaciones')
            .update(formattedData)
            .eq('id', resourceId);
        }
      } else if (resourceType === 'unidades') {
        const unidadData = dataToSave as UnidadResource;
        
        // Format dates for Supabase
        const formattedData = {
          ...unidadData,
          fecha_venta: formatDate(unidadData.fecha_venta),
          created_at: formatDate(unidadData.created_at)
        };
        
        if (!resourceId) {
          result = await supabase
            .from('unidades')
            .insert(formattedData);
        } else {
          result = await supabase
            .from('unidades')
            .update(formattedData)
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
