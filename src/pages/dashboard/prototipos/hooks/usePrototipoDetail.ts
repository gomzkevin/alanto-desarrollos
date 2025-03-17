
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import { Tables } from '@/integrations/supabase/types';

type Desarrollo = Tables<"desarrollos">;

const fetchPrototipoById = async (id: string) => {
  const { data, error } = await supabase
    .from('prototipos')
    .select('*, desarrollo:desarrollo_id(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return data as ExtendedPrototipo;
};

export const usePrototipoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    data: prototipo,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['prototipo', id],
    queryFn: () => fetchPrototipoById(id as string),
    enabled: !!id,
  });
  
  const handleBack = () => {
    const desarrollo = prototipo?.desarrollo as Desarrollo | undefined;
    if (desarrollo?.id) {
      navigate(`/dashboard/desarrollos/${desarrollo.id}`);
    } else {
      navigate('/dashboard/desarrollos');
    }
  };
  
  const updatePrototipoImage = async (imageUrl: string) => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('prototipos')
        .update({ imagen_url: imageUrl })
        .eq('id', id);
      
      if (error) throw error;
      
      await refetch();
      
      return true;
    } catch (error) {
      console.error('Error al actualizar imagen del prototipo:', error);
      return false;
    }
  };
  
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
