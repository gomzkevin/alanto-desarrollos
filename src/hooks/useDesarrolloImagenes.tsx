
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { DesarrolloImagen } from '@/types/desarrolloImagen';

export const useDesarrolloImagenes = (desarrolloId: string) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fetchDesarrolloImagenes = async (): Promise<DesarrolloImagen[]> => {
    const { data, error } = await supabase
      .from('desarrollo_imagenes')
      .select('*')
      .eq('desarrollo_id', desarrolloId)
      .order('orden', { ascending: true });
      
    if (error) {
      console.error('Error fetching desarrollo images:', error);
      throw new Error(error.message);
    }
    
    return data as DesarrolloImagen[];
  };
  
  const deleteImage = async (imageId: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('desarrollo_imagenes')
        .delete()
        .eq('id', imageId);
        
      if (error) {
        console.error('Error deleting image:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la imagen',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Éxito',
        description: 'Imagen eliminada correctamente',
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteImage:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la imagen',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadImage = async (file: File): Promise<boolean> => {
    setIsUploading(true);
    
    try {
      // 1. Upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `desarrollos/${desarrolloId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }
      
      // 2. Get the public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
      
      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      // 3. Get the max order value for the current development
      const { data: orderData, error: orderError } = await supabase
        .from('desarrollo_imagenes')
        .select('orden')
        .eq('desarrollo_id', desarrolloId)
        .order('orden', { ascending: false })
        .limit(1);
      
      if (orderError) {
        console.error('Error getting max order:', orderError);
        throw orderError;
      }
      
      const newOrder = orderData && orderData.length > 0 ? (orderData[0].orden || 0) + 1 : 0;
      
      // 4. Insert the record into the database
      const { error: insertError } = await supabase
        .from('desarrollo_imagenes')
        .insert({
          desarrollo_id: desarrolloId,
          url: urlData.publicUrl,
          orden: newOrder,
          es_principal: false
        });
      
      if (insertError) {
        console.error('Error inserting image record:', insertError);
        throw insertError;
      }
      
      toast({
        title: 'Éxito',
        description: 'Imagen subida correctamente',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: `No se pudo subir la imagen: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const setMainImage = async (imageId: string): Promise<boolean> => {
    try {
      // 1. Update all images for this desarrollo to es_principal = false
      const { error: resetError } = await supabase
        .from('desarrollo_imagenes')
        .update({ es_principal: false })
        .eq('desarrollo_id', desarrolloId);
      
      if (resetError) {
        console.error('Error resetting main images:', resetError);
        throw resetError;
      }
      
      // 2. Set the selected image as main
      const { error: updateError } = await supabase
        .from('desarrollo_imagenes')
        .update({ es_principal: true })
        .eq('id', imageId);
      
      if (updateError) {
        console.error('Error setting main image:', updateError);
        throw updateError;
      }
      
      toast({
        title: 'Éxito',
        description: 'Imagen principal actualizada',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error setting main image:', error);
      toast({
        title: 'Error',
        description: `No se pudo actualizar la imagen principal: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const query = useQuery({
    queryKey: ['desarrollo-imagenes', desarrolloId],
    queryFn: fetchDesarrolloImagenes,
    enabled: !!desarrolloId,
  });

  return {
    images: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isError: query.isError,
    deleteImage,
    isDeleting,
    uploadImage,
    isUploading,
    setMainImage,
  };
};

export default useDesarrolloImagenes;
