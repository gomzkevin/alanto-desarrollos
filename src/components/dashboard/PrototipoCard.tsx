
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tables } from '@/integrations/supabase/types';
import { formatCurrency } from '@/lib/utils';
import { Building2, Home, Ruler, Bed, Bath } from 'lucide-react';

type Prototipo = Tables<"prototipos">;

interface PrototipoCardProps {
  prototipo: Prototipo;
  onViewDetails?: (id: string) => void;
}

const PrototipoCard: React.FC<PrototipoCardProps> = ({ prototipo, onViewDetails }) => {
  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(prototipo.id);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer" onClick={handleCardClick}>
      <div className="h-48 bg-slate-200 relative">
        {prototipo.imagen_url ? (
          <img 
            src={prototipo.imagen_url} 
            alt={prototipo.nombre} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <Home className="h-16 w-16 text-slate-400" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-white/90 text-slate-700 px-2 py-1 rounded text-sm font-medium">
          {prototipo.tipo}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1 text-slate-800">{prototipo.nombre}</h3>
        
        <div className="flex items-center text-slate-600 text-sm space-x-4 mb-3">
          {prototipo.superficie && (
            <div className="flex items-center">
              <Ruler className="h-3.5 w-3.5 mr-1" />
              <span>{prototipo.superficie} m²</span>
            </div>
          )}
          
          {prototipo.habitaciones && (
            <div className="flex items-center">
              <Bed className="h-3.5 w-3.5 mr-1" />
              <span>{prototipo.habitaciones}</span>
            </div>
          )}
          
          {prototipo.baños && (
            <div className="flex items-center">
              <Bath className="h-3.5 w-3.5 mr-1" />
              <span>{prototipo.baños}</span>
            </div>
          )}
        </div>
        
        {prototipo.descripcion && (
          <p className="text-slate-600 text-sm line-clamp-2 mb-2">{prototipo.descripcion}</p>
        )}
        
        <div className="text-lg font-bold text-slate-800">
          {formatCurrency(prototipo.precio)}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-slate-100 mt-2">
        <div className="text-sm text-slate-600">
          <Building2 className="h-3.5 w-3.5 inline mr-1" />
          <span>
            {prototipo.unidades_disponibles}/{prototipo.total_unidades} disponibles
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PrototipoCard;
