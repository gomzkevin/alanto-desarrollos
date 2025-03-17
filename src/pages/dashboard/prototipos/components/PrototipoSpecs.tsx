
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Ruler, Bed, Bath, Car } from 'lucide-react';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';

interface PrototipoSpecsProps {
  prototipo: ExtendedPrototipo;
}

export const PrototipoSpecs = ({ prototipo }: PrototipoSpecsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Ruler className="h-6 w-6 text-slate-400 mb-2" />
          <div className="text-sm text-slate-500">Superficie</div>
          <div className="font-semibold">{prototipo.superficie || 0} m²</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Bed className="h-6 w-6 text-slate-400 mb-2" />
          <div className="text-sm text-slate-500">Habitaciones</div>
          <div className="font-semibold">{prototipo.habitaciones || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Bath className="h-6 w-6 text-slate-400 mb-2" />
          <div className="text-sm text-slate-500">Baños</div>
          <div className="font-semibold">{prototipo.baños || 0}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <Car className="h-6 w-6 text-slate-400 mb-2" />
          <div className="text-sm text-slate-500">Estacionamientos</div>
          <div className="font-semibold">{prototipo.estacionamientos || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrototipoSpecs;
