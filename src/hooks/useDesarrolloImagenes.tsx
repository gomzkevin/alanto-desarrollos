
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export type DesarrolloImagen = {
  id: string;
  desarrollo_id: string;
  url: string;
  es_principal: boolean;
  orden: number;
  created_at: string;
};

export const useDesarrolloImagenes = (desarrolloId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Function to fetch images for a specific desarrollo
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
  
  // Query to fetch the images
  const imagesQuery = useQuery({
    queryKey: ['desarrollo-imagenes', desarrolloId],
    queryFn: fetchImages,
    enabled: !!desarrolloId,
  });
  
  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!desarrolloId) throw new Error('Desarrollo ID is required');
      
      const fileName = `${desarrolloId}/${Date.now()}-${file.name}`;
      
      // 1. Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('desarrollo-images')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }
      
      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('desarrollo-images')
        .getPublicUrl(fileName);
      
      const url = publicUrlData.publicUrl;
      
      // 3. Save to database
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
      // Invalidate query to refetch images
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
  
  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      // Get the image to get the URL
      const { data: image, error: getError } = await supabase
        .from('desarrollo_imagenes')
        .select('url')
        .eq('id', imageId)
        .single();
        
      if (getError) {
        console.error('Error getting image:', getError);
        throw getError;
      }
      
      // Extract the path from the URL
      const url = image.url;
      const pathParts = url.split('/');
      const path = `${desarrolloId}/${pathParts[pathParts.length - 1]}`;
      
      // 1. Delete from the database
      const { error: deleteError } = await supabase
        .from('desarrollo_imagenes')
        .delete()
        .eq('id', imageId);
      
      if (deleteError) {
        console.error('Error deleting image:', deleteError);
        throw deleteError;
      }
      
      // 2. Delete from storage
      try {
        const { error: storageError } = await supabase.storage
          .from('desarrollo-images')
          .remove([path]);
          
        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
          // Don't throw here, as we already deleted from the database
        }
      } catch (e) {
        console.error('Error trying to delete from storage:', e);
        // Continue even if storage delete fails
      }
      
      return { id: imageId };
    },
    onSuccess: () => {
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente.",
      });
      // Invalidate query to refetch images
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
  
  // Set main image mutation
  const setMainImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!desarrolloId) throw new Error('Desarrollo ID is required');
      
      // 1. Unset all existing main images
      const { error: unsetError } = await supabase
        .from('desarrollo_imagenes')
        .update({ es_principal: false })
        .eq('desarrollo_id', desarrolloId);
      
      if (unsetError) {
        console.error('Error unsetting main images:', unsetError);
        throw unsetError;
      }
      
      // 2. Set the new main image
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
      // Invalidate query to refetch images
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
  
  // Reorder images mutation
  const reorderImagesMutation = useMutation({
    mutationFn: async (imageIds: string[]) => {
      if (!desarrolloId) throw new Error('Desarrollo ID is required');
      
      // Update each image with its new order
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
      // Invalidate query to refetch images
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
  
  return {
    images: imagesQuery.data || [],
    isLoading: imagesQuery.isLoading,
    error: imagesQuery.error,
    refetch: imagesQuery.refetch,
    uploadImage: uploadImageMutation.mutate,
    deleteImage: deleteImageMutation.mutate,
    setMainImage: setMainImageMutation.mutate,
    reorderImages: reorderImagesMutation.mutate,
    isUploading: uploadImageMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
  };
};

export default useDesarrolloImagenes;
