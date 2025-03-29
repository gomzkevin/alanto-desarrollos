
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

type Desarrollo = Tables<"desarrollos">;

const fetchPrototipoById = async (id: string) => {
  if (!id) return null;
  
  const { data, error } = await supabase
    .from('prototipos')
    .select('*, desarrollo:desarrollo_id(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  
  return data as ExtendedPrototipo;
};

export const usePrototipoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    data: prototipo,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['prototipo', id],
    queryFn: () => fetchPrototipoById(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
  
  const handleBack = useCallback(() => {
    const desarrollo = prototipo?.desarrollo as Desarrollo | undefined;
    if (desarrollo?.id) {
      navigate(`/dashboard/desarrollos/${desarrollo.id}`);
    } else {
      navigate('/dashboard/desarrollos');
    }
  }, [prototipo?.desarrollo, navigate]);
  
  const updatePrototipoImage = useCallback(async (imageUrl: string) => {
    if (!id) {
      console.error('No se puede actualizar la imagen: ID del prototipo no disponible');
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen: ID no válido",
        variant: "destructive"
      });
      return false;
    }
    
    console.log(`Actualizando imagen del prototipo ${id} con URL:`, imageUrl);
    
    try {
      const { error } = await supabase
        .from('prototipos')
        .update({ imagen_url: imageUrl })
        .eq('id', id);
      
      if (error) {
        console.error('Error al actualizar imagen del prototipo en la base de datos:', error);
        toast({
          title: "Error",
          description: `No se pudo guardar la imagen: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      
      console.log('Imagen de prototipo actualizada exitosamente en la base de datos');
      
      // Refrescar los datos después de la actualización
      await refetch();
      
      toast({
        title: "Éxito",
        description: "Imagen del prototipo actualizada correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error al actualizar imagen del prototipo:', error);
      return false;
    }
  }, [id, toast, refetch]);
  
  return {
    id,
    prototipo,
    isLoading,
    error,
    refetch,
    handleBack,
    updatePrototipoImage
  };
};

export default usePrototipoDetail;
