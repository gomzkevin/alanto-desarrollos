
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, Building2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { countUnidadesByStatus } from '@/hooks/unidades/countUtils';
import { useNavigate } from 'react-router-dom';

type PrototipoCardProps = {
  prototipo: Tables<"prototipos">;
  onClick?: (id: string) => void;
  onViewDetails?: (id: string) => void;
};

const PrototipoCard = ({ prototipo, onClick, onViewDetails }: PrototipoCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [unidadesStats, setUnidadesStats] = useState({
    disponibles: 0,
    vendidas: 0,
    con_anticipo: 0,
    total: 0
  });
  const navigate = useNavigate();
  
  // Memoize click handler to prevent re-renders
  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop propagation to avoid unexpected behaviors
    
    if (onViewDetails) {
      onViewDetails(prototipo.id);
    } else if (onClick) {
      onClick(prototipo.id);
    } else {
      // Use navigate instead of changing location.href to avoid reloads
      navigate(`/dashboard/prototipos/${prototipo.id}`);
    }
  }, [prototipo.id, onViewDetails, onClick, navigate]);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchCardData = async () => {
      setIsLoading(true);
      
      try {
        // Load image if available
        if (prototipo.imagen_url) {
          setImageUrl(prototipo.imagen_url);
        }
        
        // Get actual unit counts
        const unitStats = await countUnidadesByStatus(prototipo.id);
        if (isMounted) {
          setUnidadesStats(unitStats);
        }
      } catch (error) {
        console.error('Error loading prototipo card data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchCardData();
    
    return () => {
      isMounted = false;
    };
  }, [prototipo.id, prototipo.imagen_url]);
  
  const fallbackImage = "/placeholder.svg";
  
  const getUnitCountDisplay = () => {
    // Use actual unit statistics from database
    const available = unidadesStats.disponibles;
    const total = unidadesStats.total || prototipo.total_unidades || 0;
    
    return `${available}/${total}`;
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col transition hover:shadow-md">
      <div className="relative h-48 bg-slate-100">
        {isLoading ? (
          <div className="absolute inset-0 animate-pulse bg-slate-200" />
        ) : (
          <img
            src={imageUrl || fallbackImage}
            alt={prototipo.nombre}
            className="h-full w-full object-cover"
            onError={() => setImageUrl(fallbackImage)}
          />
        )}
        <Badge className="absolute top-2 right-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
          {prototipo.tipo || 'Prototipo'}
        </Badge>
      </div>
      
      <CardContent className="flex-1 p-5">
        <h3 className="font-bold text-xl mb-2">{prototipo.nombre}</h3>
        
        <div className="flex items-center text-indigo-600 font-semibold mb-3">
          ${prototipo.precio?.toLocaleString('es-MX') || '0'}
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Badge variant="outline" className="flex items-center justify-center gap-1 py-1">
            <Bed className="h-3.5 w-3.5" />
            <span>{prototipo.habitaciones || 0}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center justify-center gap-1 py-1">
            <Bath className="h-3.5 w-3.5" />
            <span>{prototipo.baños || 0}</span>
          </Badge>
          <Badge variant="outline" className="flex items-center justify-center gap-1 py-1">
            <Square className="h-3.5 w-3.5" />
            <span>{prototipo.superficie || 0} m²</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-slate-500 text-sm">
          <Building2 className="h-4 w-4" />
          <span>
            {isLoading ? (
              <span className="animate-pulse">Cargando unidades...</span>
            ) : (
              `${getUnitCountDisplay()} disponibles`
            )}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleViewDetails}
          type="button" // Explicitly set type to prevent submit behavior
        >
          Ver detalles
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PrototipoCard;
