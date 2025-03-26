
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Building2, Bed, Bath, Square } from 'lucide-react';

interface PrototipoCardProps {
  id: number;
  image: string;
  title: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  description: string;
  status: string;
}

const PrototipoCard = ({ 
  id, 
  image, 
  title, 
  price, 
  bedrooms, 
  bathrooms, 
  area, 
  description,
  status
}: PrototipoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
      <div className="relative overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
          <img 
            src={image} 
            alt={title}
            className={`object-cover w-full h-full transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            loading="lazy"
            onLoad={(e) => {
              (e.target as HTMLElement).parentElement?.querySelector('.animate-pulse')?.classList.add('hidden');
            }}
          />
        </AspectRatio>
        <div className="absolute top-3 left-3">
          <Badge className={`px-3 py-1 text-xs font-medium text-white ${status === 'Disponible' ? 'bg-green-600' : 'bg-amber-600'}`}>
            {status}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-lg font-semibold text-indigo-600 mb-3">{price}</p>
        <p className="text-slate-600 mb-4">{description}</p>
        
        <div className="flex gap-4 mt-4">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1 text-slate-500" />
            <span className="text-sm text-slate-700">{bedrooms} Recámaras</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1 text-slate-500" />
            <span className="text-sm text-slate-700">{bathrooms} Baños</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1 text-slate-500" />
            <span className="text-sm text-slate-700">{area} m²</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-slate-200 pt-4">
        <div className="flex justify-between w-full text-sm">
          <div className="text-slate-500">Unidades disponibles: 5</div>
          <div className="text-indigo-600 font-medium">Detalles</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PrototipoCard;
