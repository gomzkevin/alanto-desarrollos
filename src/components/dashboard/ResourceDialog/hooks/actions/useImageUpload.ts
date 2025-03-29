
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useImageUpload = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `prototipo-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('prototipo-images')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: 'Error',
          description: `No se pudo subir la imagen: ${uploadError.message}`,
          variant: 'destructive',
        });
        return null;
      }
      
      const { data } = supabase.storage
        .from('prototipo-images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al subir la imagen',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleImageUpload,
    isUploading
  };
};

export default useImageUpload;
