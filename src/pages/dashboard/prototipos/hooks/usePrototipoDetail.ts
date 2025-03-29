
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
  
  // Consulta estable que no cambia entre renderizados
  const queryResult = useQuery({
    queryKey: ['prototipo', id],
    queryFn: () => fetchPrototipoById(id as string),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    refetchOnWindowFocus: false // Prevenir recargas al cambiar de ventana
  });
  
  const handleBack = useCallback((e?: React.MouseEvent) => {
    // Prevenir comportamiento por defecto si se proporciona un evento
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
      console.error('No se puede actualizar la imagen: ID no disponible o actualización en progreso');
      if (!id) {
        toast({
          title: "Error",
          description: "No se pudo actualizar la imagen: ID no válido",
          variant: "destructive"
        });
      }
      return false;
    }
    
    console.log(`Actualizando imagen del prototipo ${id} con URL:`, imageUrl);
    
    try {
      setIsUpdatingImage(true);
      
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
        return false;
      }
      
      console.log('Imagen de prototipo actualizada exitosamente en la base de datos');
      
      // Refrescar los datos después de la actualización
      queryResult.refetch();
      
      toast({
        title: "Éxito",
        description: "Imagen del prototipo actualizada correctamente",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error al actualizar imagen del prototipo:', error);
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
