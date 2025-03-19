
import { useState } from 'react';
import { useDesarrolloImagenes } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Plus, Trash2, Star, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DesarrolloImagen } from '@/types/desarrolloImagen';

interface DesarrolloImageCarouselProps {
  desarrolloId: string;
  editable?: boolean;
}

const DesarrolloImageCarousel = ({ desarrolloId, editable = false }: DesarrolloImageCarouselProps) => {
  const { images, isLoading, uploadImage, deleteImage, setMainImage, isUploading, isDeleting } = useDesarrolloImagenes(desarrolloId);
  const { toast } = useToast();
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos de imagen.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El tamaño máximo permitido es 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Uploading image file:', file.name);
    uploadImage(file);
    
    // Reset the input value so the same file can be uploaded again if needed
    e.target.value = '';
  };
  
  const handleDelete = (imageId: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      deleteImage(imageId);
    }
  };
  
  const handleSetMain = (imageId: string) => {
    setMainImage(imageId);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-lg">
        {editable ? (
          <>
            <p className="text-slate-700 mb-4">No hay imágenes para este desarrollo</p>
            <div className="mt-2">
              <Button variant="outline" className="relative" disabled={isUploading}>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Agregar imagen
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  accept="image/*"
                  disabled={isUploading}
                />
              </Button>
            </div>
          </>
        ) : (
          <p className="text-slate-700">No hay imágenes disponibles</p>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image) => (
            <CarouselItem key={image.id}>
              <div 
                className="relative overflow-hidden rounded-lg"
                onMouseEnter={() => setHoveredImage(image.id)}
                onMouseLeave={() => setHoveredImage(null)}
              >
                <AspectRatio ratio={16 / 9}>
                  <img 
                    src={image.url} 
                    alt="Imagen del desarrollo" 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                
                {editable && hoveredImage === image.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(image.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {!image.es_principal && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleSetMain(image.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                
                {image.es_principal && (
                  <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 text-xs rounded-full">
                    Principal
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white" />
        <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white" />
      </Carousel>
      
      {editable && (
        <div className="flex justify-end">
          <Button variant="outline" className="relative" disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Subir imagen
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
              accept="image/*"
              disabled={isUploading}
            />
          </Button>
        </div>
      )}
    </div>
  );
};

export default DesarrolloImageCarousel;
