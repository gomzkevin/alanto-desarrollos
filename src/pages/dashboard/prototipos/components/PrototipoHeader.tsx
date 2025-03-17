
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Pencil, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import { Tables } from '@/integrations/supabase/types';

type Desarrollo = Tables<"desarrollos">;

interface PrototipoHeaderProps {
  prototipo: ExtendedPrototipo;
  onBack: () => void;
  onEdit: () => void;
}

export const PrototipoHeader = ({ prototipo, onBack, onEdit }: PrototipoHeaderProps) => {
  const desarrollo = prototipo.desarrollo as Desarrollo | null;
  
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar prototipo
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{prototipo.nombre}</h1>
            <div className="flex items-center gap-2 mt-1 text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{desarrollo?.nombre || 'Desarrollo no especificado'}</span>
              <Badge className="ml-2 capitalize">{prototipo.tipo}</Badge>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(prototipo.precio)}
          </div>
        </div>
        
        {prototipo.descripcion && (
          <p className="text-slate-700 mt-2">{prototipo.descripcion}</p>
        )}
      </div>
    </div>
  );
};

export default PrototipoHeader;
