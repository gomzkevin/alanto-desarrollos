
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, Home, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DesarrolloCardProps = {
  desarrollo: {
    id: string;
    nombre: string;
    ubicacion: string;
    total_unidades: number;
    unidades_disponibles: number;
    avance_porcentaje?: number;
    fecha_entrega?: string;
    descripcion?: string;
    imagen_url?: string;
  };
  onViewDetails?: (id: string) => void;
};

const DesarrolloCard = ({ desarrollo, onViewDetails }: DesarrolloCardProps) => {
  const [isImageError, setIsImageError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(desarrollo.id);
    } else {
      navigate(`/dashboard/desarrollos/${desarrollo.id}`);
    }
  };
  
  const handleAdminLeads = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Próximamente",
      description: "Esta funcionalidad estará disponible pronto.",
    });
  };
  
  return (
    <Card 
      key={desarrollo.id} 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleViewDetails}
    >
      <div className="aspect-video w-full overflow-hidden bg-slate-100">
        {desarrollo.imagen_url && !isImageError ? (
          <img
            src={desarrollo.imagen_url}
            alt={desarrollo.nombre}
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
            <h3 className="text-xl font-semibold">{desarrollo.nombre}</h3>
            <p className="text-sm text-slate-500">{desarrollo.ubicacion}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            desarrollo.avance_porcentaje && desarrollo.avance_porcentaje < 100
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {desarrollo.avance_porcentaje && desarrollo.avance_porcentaje < 100 ? 'En construcción' : 'Terminado'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <CalendarClock className="h-4 w-4 mr-2" />
              <span>Entrega</span>
            </div>
            <p className="font-medium">
              {desarrollo.fecha_entrega 
                ? new Date(desarrollo.fecha_entrega).toLocaleDateString('es-MX', {
                    month: 'short',
                    year: 'numeric'
                  })
                : 'Por definir'
              }
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <Home className="h-4 w-4 mr-2" />
              <span>Disponibilidad</span>
            </div>
            <p className="font-medium">
              {desarrollo.unidades_disponibles}/{desarrollo.total_unidades} unidades
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <Users className="h-4 w-4 mr-2" />
              <span>Leads activos</span>
            </div>
            <p className="font-medium">
              {/* In a real app, this would come from the database */}
              {Math.floor(Math.random() * 20)} leads
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-slate-500">
              <span className="h-4 w-4 mr-2">%</span>
              <span>Avance</span>
            </div>
            <p className="font-medium">
              {desarrollo.avance_porcentaje ?? 
                Math.round((1 - desarrollo.unidades_disponibles / desarrollo.total_unidades) * 100)}%
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          handleViewDetails();
        }}>
          Ver detalles
        </Button>
        <Button variant="outline" size="sm" onClick={handleAdminLeads}>
          Administrar leads
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DesarrolloCard;
