
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { DesarrolloImagen } from '@/types/desarrolloImagen';

export const useDesarrolloImagenes = (desarrolloId: string) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  };
};

export default useDesarrolloImagenes;
