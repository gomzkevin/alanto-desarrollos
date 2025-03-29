
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';

type Desarrollo = Tables<"desarrollos">;

const fetchPrototipoById = async (id: string) => {
  if (!id) return null;
  
  console.log(`Fetching prototipo with ID: ${id}`);
  
  const { data, error } = await supabase
    .from('prototipos')
    .select('*, desarrollo:desarrollo_id(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching prototipo:', error);
    throw error;
  }
  
  console.log('Prototipo fetched successfully:', data);
  return data as ExtendedPrototipo;
};

export const usePrototipoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  
  // Stable query that doesn't change between renders
  const queryResult = useQuery({
    queryKey: ['prototipo', id],
    queryFn: () => fetchPrototipoById(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false // Prevent reloads when changing window
  });
  
  const handleBack = useCallback((e?: React.MouseEvent) => {
    // Prevent default behavior if an event is provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const desarrollo = queryResult.data?.desarrollo as Desarrollo | undefined;
    if (desarrollo?.id) {
      navigate(`/dashboard/desarrollos/${desarrollo.id}`);
    } else {
      navigate('/dashboard/desarrollos');
    }
  }, [queryResult.data?.desarrollo, navigate]);
  
  const updatePrototipoImage = useCallback(async (imageUrl: string) => {
    if (isUpdatingImage || !id) {
      console.error('Cannot update image: ID not available or update in progress');
      if (!id) {
        toast({
          title: "Error",
          description: "No se pudo actualizar la imagen: ID no válido",
          variant: "destructive"
        });
      }
      return false;
    }
    
    console.log(`Updating prototipo ${id} image with URL:`, imageUrl);
    
    try {
      setIsUpdatingImage(true);
      
      const { error } = await supabase
        .from('prototipos')
        .update({ imagen_url: imageUrl })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating prototipo image in database:', error);
        toast({
          title: "Error",
          description: `No se pudo guardar la imagen: ${error.message}`,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Prototipo image successfully updated in database');
      
      // Refresh data after update
      queryResult.refetch();
      
      toast({
        title: "Éxito",
        description: "Imagen del prototipo actualizada correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating prototipo image:', error);
      return false;
    } finally {
      setIsUpdatingImage(false);
    }
  }, [id, toast, queryResult.refetch, isUpdatingImage]);
  
  return {
    id,
    prototipo: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    handleBack,
    updatePrototipoImage
  };
};

export default usePrototipoDetail;
