
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from '@/integrations/supabase/types';

type Desarrollo = Tables<"desarrollos">;

type DesarrolloCardProps = {
  desarrollo: Desarrollo;
  onViewDetails: (id: string) => void;
};

const DesarrolloCard = ({ desarrollo, onViewDetails }: DesarrolloCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Calculate status based on comercial progress
  const getDesarrolloStatus = (desarrollo: Desarrollo) => {
    if (desarrollo.avance_porcentaje === 0) {
      return { label: 'Pre-venta', color: 'bg-blue-100 text-blue-800' };
    } else if (desarrollo.avance_porcentaje && desarrollo.avance_porcentaje < 100) {
      return { label: 'En venta', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Vendido', color: 'bg-green-100 text-green-800' };
    }
  };
  
  const status = getDesarrolloStatus(desarrollo);
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onViewDetails(desarrollo.id)}
    >
      <div className="relative h-48 bg-slate-200">
        {desarrollo.imagen_url ? (
          <img 
            src={desarrollo.imagen_url} 
            alt={desarrollo.nombre} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            No hay imagen disponible
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge className={status.color}>
            {status.label}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5">
        <h3 className="text-xl font-bold mb-2">{desarrollo.nombre}</h3>
        <p className="text-slate-600 mb-3">{desarrollo.ubicacion}</p>
        
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-slate-500">Unidades</p>
            <p className="font-medium">{desarrollo.unidades_disponibles}/{desarrollo.total_unidades} disponibles</p>
          </div>
          <div>
            <p className="text-slate-500">Avance</p>
            <p className="font-medium">{desarrollo.avance_porcentaje ?? 0}%</p>
          </div>
        </div>
        
        <Button 
          variant="secondary"
          className="w-full mt-4"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(desarrollo.id);
          }}
        >
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  );
};

export default DesarrolloCard;
