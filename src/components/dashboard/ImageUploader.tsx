
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  entityId: string;
  bucketName: string;
  folderPath: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
}

const ImageUploader = ({ 
  entityId, 
  bucketName, 
  folderPath, 
  currentImageUrl, 
  onImageUploaded 
}: ImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "El archivo debe ser una imagen",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Crear un nombre único para el archivo usando timestamp y entityId
      const fileExt = file.name.split('.').pop();
      const fileName = `${folderPath}/${entityId}-${Date.now()}.${fileExt}`;
      
      console.log('Subiendo archivo:', fileName, 'al bucket:', bucketName);
      
      // Subir el archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error al subir imagen:', error);
        throw error;
      }
      
      // Obtener la URL pública del archivo
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      const imageUrl = publicUrlData.publicUrl;
      console.log('Imagen subida exitosamente. URL:', imageUrl);
      
      // Mostrar la imagen en la vista previa
      setPreviewUrl(imageUrl);
      
      // Llamar al callback con la nueva URL
      onImageUploaded(imageUrl);
      
      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      });
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      toast({
        title: "Error",
        description: `Error al subir la imagen: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    
    toast({
      title: "Imagen eliminada",
      description: "La imagen ha sido eliminada del formulario",
    });
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Vista previa" 
            className="w-full h-48 object-cover rounded-md border border-gray-200" 
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
            onClick={handleRemoveImage}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center">
            <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Arrastra una imagen o haz clic para seleccionar</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG o WEBP (máx. 5MB)</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        <Button 
          type="button" 
          variant={previewUrl ? "outline" : "default"} 
          onClick={() => document.getElementById(`file-upload-${entityId}`)?.click()}
          disabled={isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
              Subiendo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {previewUrl ? 'Cambiar imagen' : 'Subir imagen'}
            </>
          )}
        </Button>
      </div>
      
      <input
        id={`file-upload-${entityId}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
