
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Square, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type PrototipoCardProps = {
  prototipo: {
    id: string;
    nombre: string;
    tipo: string;
    habitaciones: number | null;
    baños: number | null;
    superficie: number | null;
    precio: number;
    total_unidades: number;
    unidades_disponibles: number;
    descripcion: string | null;
    imagen_url: string | null;
  };
};

const PrototipoCard = ({ prototipo }: PrototipoCardProps) => {
  const [isImageError, setIsImageError] = useState(false);

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video w-full overflow-hidden bg-slate-100">
        {prototipo.imagen_url && !isImageError ? (
          <img
            src={prototipo.imagen_url}
            alt={prototipo.nombre}
            className="h-full w-full object-cover"
            onError={() => setIsImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100">
            <Home className="h-12 w-12 text-slate-400" />
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{prototipo.nombre}</h3>
            <p className="text-sm text-slate-500">{prototipo.tipo}</p>
          </div>
          <span className="text-lg font-bold text-indigo-600">
            {formatCurrency(prototipo.precio)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-slate-700 mb-4">{prototipo.descripcion}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <Bed className="h-4 w-4 mr-2" />
              <span>Habitaciones</span>
            </div>
            <p className="font-medium">{prototipo.habitaciones || 'N/A'}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <Bath className="h-4 w-4 mr-2" />
              <span>Baños</span>
            </div>
            <p className="font-medium">{prototipo.baños || 'N/A'}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <Square className="h-4 w-4 mr-2" />
              <span>Superficie</span>
            </div>
            <p className="font-medium">
              {prototipo.superficie ? `${prototipo.superficie} m²` : 'N/A'}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <Home className="h-4 w-4 mr-2" />
              <span>Disponibilidad</span>
            </div>
            <p className="font-medium">
              {prototipo.unidades_disponibles}/{prototipo.total_unidades} unidades
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" size="sm">Ver detalles</Button>
        <Button variant="outline" size="sm">Cotizar</Button>
      </CardFooter>
    </Card>
  );
};

export default PrototipoCard;
