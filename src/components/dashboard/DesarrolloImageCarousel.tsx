
import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export interface DesarrolloImagen {
  id: string;
  desarrollo_id: string;
  url: string;
  es_principal?: boolean;
  orden?: number;
}

export interface DesarrolloImageCarouselProps {
  images: DesarrolloImagen[];
}

const DesarrolloImageCarousel = ({ images }: DesarrolloImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-gray-200">
        <AspectRatio ratio={16/9}>
          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
            No hay imágenes disponibles
          </div>
        </AspectRatio>
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-4xl mx-auto">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={image.id}>
            <AspectRatio ratio={16/9}>
              <img 
                src={image.url} 
                alt={`Imagen ${index + 1} del desarrollo`}
                className="object-cover w-full h-full rounded-lg"
              />
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
};

export default DesarrolloImageCarousel;
