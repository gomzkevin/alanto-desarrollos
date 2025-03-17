
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Building2, Home, Ruler, Bed, Bath, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Prototipo = Tables<"prototipos">;

interface PrototipoCardProps {
  prototipo: Prototipo;
  onViewDetails?: (id: string) => void;
}

const PrototipoCard: React.FC<PrototipoCardProps> = ({ prototipo, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    console.log('Clicked on prototype card with ID:', prototipo.id);
    if (onViewDetails) {
      onViewDetails(prototipo.id);
    } else {
      navigate(`/dashboard/prototipos/${prototipo.id}`);
    }
  };

  return (
    <div 
      className="overflow-hidden rounded-xl bg-white border border-slate-100 shadow-soft transition-all duration-300 hover:shadow-medium"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Property Image */}
      <div className="relative overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
          {prototipo.imagen_url ? (
            <img 
              src={prototipo.imagen_url} 
              alt={prototipo.nombre}
              className={`object-cover w-full h-full transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
              loading="lazy"
              onLoad={(e) => {
                (e.target as HTMLElement).parentElement?.querySelector('.animate-pulse')?.classList.add('hidden');
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-100">
              <Home className="h-16 w-16 text-slate-400" />
            </div>
          )}
        </AspectRatio>
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded-full shadow-sm">
            {prototipo.tipo}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">{prototipo.nombre}</h3>
        
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>Prototipo</span>
        </div>
        
        <p className="text-lg font-semibold text-indigo-600 mb-4">{formatCurrency(prototipo.precio)}</p>
        
        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <div className="flex space-x-4 text-slate-700">
            {prototipo.habitaciones && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1 text-slate-400" />
                <span className="text-sm">{prototipo.habitaciones}</span>
              </div>
            )}
            
            {prototipo.baños && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1 text-slate-400" />
                <span className="text-sm">{prototipo.baños}</span>
              </div>
            )}
            
            {prototipo.superficie && (
              <div className="flex items-center">
                <Ruler className="h-4 w-4 mr-1 text-slate-400" />
                <span className="text-sm">{prototipo.superficie} m²</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Action button */}
      <CardFooter className="px-5 pb-5 border-t border-slate-100 pt-4">
        <div className="flex items-center text-sm text-slate-600">
          <Building2 className="h-4 w-4 mr-1" />
          <span>{prototipo.unidades_disponibles}/{prototipo.total_unidades} disponibles</span>
        </div>
        
        <Button 
          variant="outline" 
          className="ml-auto justify-between group"
          onClick={handleCardClick}
        >
          <span>Ver detalles</span>
          <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </div>
  );
};

export default PrototipoCard;
