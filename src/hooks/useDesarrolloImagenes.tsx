import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { Json } from '@/integrations/supabase/types';

export type DesarrolloImagen = {
  id: string;
  desarrollo_id: string;
  url: string;
  es_principal: boolean;
  orden: number;
  created_at: string;
};

interface Desarrollo {
  id: string;
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  avance_porcentaje?: number;
  fecha_inicio?: string;
  fecha_entrega?: string;
  descripcion?: string;
  imagen_url?: string;
  moneda?: string;
  comision_operador?: number;
  mantenimiento_valor?: number;
  es_mantenimiento_porcentaje?: boolean;
  gastos_fijos?: number;
  es_gastos_fijos_porcentaje?: boolean;
  gastos_variables?: number;
  es_gastos_variables_porcentaje?: boolean;
  impuestos?: number;
  es_impuestos_porcentaje?: boolean;
  adr_base?: number;
  ocupacion_anual?: number;
  amenidades?: string[] | null;
}

export const useDesarrolloImagenes = (desarrolloId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const fetchImages = async (): Promise<DesarrolloImagen[]> => {
    if (!desarrolloId) return [];
    
    const { data, error } = await supabase
      .from('desarrollo_imagenes')
      .select('*')
      .eq('desarrollo_id', desarrolloId)
      .order('orden');
    
    if (error) {
      console.error('Error fetching desarrollo images:', error);
      throw new Error(error.message);
    }
    
    return data as DesarrolloImagen[];
  };
  
  const imagesQuery = useQuery({
    queryKey: ['desarrollo-imagenes', desarrolloId],
    queryFn: fetchImages,
    enabled: !!desarrolloId,
  });
  
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!desarrolloId) throw new Error('Desarrollo ID is required');
      
      const fileName = `${desarrolloId}/${Date.now()}-${file.name}`;
      
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
      
      const url = publicUrlData.publicUrl;
      
      const { data: imageData, error: imageError } = await supabase
        .from('desarrollo_imagenes')
        .insert([{
          desarrollo_id: desarrolloId,
          url,
          es_principal: false,
          orden: (imagesQuery.data?.length || 0) + 1,
        }])
        .select()
        .single();
      
      if (imageError) {
        console.error('Error saving image data:', imageError);
        throw imageError;
      }
      
      return imageData;
    },
    onSuccess: () => {
      toast({
        title: "Imagen subida",
        description: "La imagen se ha guardado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['desarrollo-imagenes', desarrolloId] });
    },
    onError: (error) => {
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { data: image, error: getError } = await supabase
        .from('desarrollo_imagenes')
        .select('url')
        .eq('id', imageId)
        .single();
        
      if (getError) {
        console.error('Error getting image:', getError);
        throw getError;
      }
      
      const url = image.url;
      const pathParts = url.split('/');
      const path = `${desarrolloId}/${pathParts[pathParts.length - 1]}`;
      
      const { error: deleteError } = await supabase
        .from('desarrollo_imagenes')
        .delete()
        .eq('id', imageId);
      
      if (deleteError) {
        console.error('Error deleting image:', deleteError);
        throw deleteError;
      }
      
      try {
        const { error: storageError } = await supabase.storage
          .from('desarrollo-images')
          .remove([path]);
          
        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
        }
      } catch (e) {
        console.error('Error trying to delete from storage:', e);
      }
      
      return { id: imageId };
    },
    onSuccess: () => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['desarrollo-imagenes', desarrolloId] });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar imagen",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const setMainImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!desarrolloId) throw new Error('Desarrollo ID is required');
      
      const { error: unsetError } = await supabase
        .from('desarrollo_imagenes')
        .update({ es_principal: false })
        .eq('desarrollo_id', desarrolloId);
      
      if (unsetError) {
        console.error('Error unsetting main images:', unsetError);
        throw unsetError;
      }
      
      const { data, error } = await supabase
        .from('desarrollo_imagenes')
        .update({ es_principal: true })
        .eq('id', imageId)
        .select()
        .single();
      
      if (error) {
        console.error('Error setting main image:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Imagen principal actualizada",
        description: "Se ha establecido la imagen principal.",
      });
      queryClient.invalidateQueries({ queryKey: ['desarrollo-imagenes', desarrolloId] });
    },
    onError: (error) => {
      toast({
        title: "Error al establecer imagen principal",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const reorderImagesMutation = useMutation({
    mutationFn: async (imageIds: string[]) => {
      if (!desarrolloId) throw new Error('Desarrollo ID is required');
      
      const updates = imageIds.map((id, index) => ({
        id,
        orden: index + 1
      }));
      
      const promises = updates.map(update => 
        supabase
          .from('desarrollo_imagenes')
          .update({ orden: update.orden })
          .eq('id', update.id)
      );
      
      await Promise.all(promises);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Orden actualizado",
        description: "Se ha actualizado el orden de las imágenes.",
      });
      queryClient.invalidateQueries({ queryKey: ['desarrollo-imagenes', desarrolloId] });
    },
    onError: (error) => {
      toast({
        title: "Error al reordenar imágenes",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateAmenitiesMutation = useMutation({
    mutationFn: async (amenities: string[]) => {
      if (!desarrolloId) throw new Error('Desarrollo ID is required');
      
      console.log('Updating amenities to:', amenities);
      
      const { data, error } = await supabase
        .from('desarrollos')
        .update({ 
          amenidades: amenities
        })
        .eq('id', desarrolloId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating amenities:', error);
        throw error;
      }
      
      return data as Desarrollo;
    },
    onSuccess: () => {
      toast({
        title: "Amenidades actualizadas",
        description: "Las amenidades se han actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar amenidades",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    images: imagesQuery.data || [],
    isLoading: imagesQuery.isLoading,
    error: imagesQuery.error,
    refetch: imagesQuery.refetch,
    uploadImage: uploadImageMutation.mutate,
    deleteImage: deleteImageMutation.mutate,
    setMainImage: setMainImageMutation.mutate,
    reorderImages: reorderImagesMutation.mutate,
    updateAmenities: updateAmenitiesMutation.mutate,
    isUploading: uploadImageMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
  };
};

export default useDesarrolloImagenes;
