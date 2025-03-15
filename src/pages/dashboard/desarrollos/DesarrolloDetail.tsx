
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ChevronLeft, Home, MapPin, Clock, CalendarClock, ImageIcon, Package } from 'lucide-react';
import PrototipoCard from '@/components/dashboard/PrototipoCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import usePrototipos from '@/hooks/usePrototipos';
import { Tables } from '@/integrations/supabase/types';
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';
import DesarrolloImageCarousel from '@/components/dashboard/DesarrolloImageCarousel';
import { useUserRole } from '@/hooks';
import { Badge } from '@/components/ui/badge';

type Desarrollo = Tables<"desarrollos"> & {
  amenidades?: string[] | string;
};

const fetchDesarrolloById = async (id: string) => {
  console.log('Fetching desarrollo with ID:', id);
  const { data, error } = await supabase
    .from('desarrollos')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching desarrollo:', error);
    throw new Error(error.message);
  }
  
  console.log('Desarrollo fetched:', data);
  return data as Desarrollo;
};

const getDesarrolloStatus = (desarrollo: Desarrollo) => {
  if (desarrollo.avance_porcentaje === 0) {
    return { label: 'Pre-venta', color: 'bg-blue-100 text-blue-800' };
  } else if (desarrollo.avance_porcentaje && desarrollo.avance_porcentaje < 100) {
    return { label: 'En venta', color: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { label: 'Vendido', color: 'bg-green-100 text-green-800' };
  }
};

const DesarrolloDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  
  const { 
    data: desarrollo, 
    isLoading: isLoadingDesarrollo,
    error: errorDesarrollo,
    refetch: refetchDesarrollo 
  } = useQuery({
    queryKey: ['desarrollo', id],
    queryFn: () => fetchDesarrolloById(id as string),
    enabled: !!id,
  });
  
  const { 
    prototipos = [], 
    isLoading: isLoadingPrototipos,
    error: errorPrototipos,
    refetch: refetchPrototipos
  } = usePrototipos({
    desarrolloId: id,
  });
  
  const handleVolver = () => {
    navigate('/dashboard/desarrollos');
  };
  
  const handleRefresh = () => {
    refetchDesarrollo();
    refetchPrototipos();
  };
  
  const isLoading = isLoadingDesarrollo || isLoadingPrototipos;
  const hasError = errorDesarrollo || errorPrototipos;
  
  // Parse amenidades if they exist
  const parseAmenidades = (amenidades: string[] | string | undefined): string[] => {
    if (!amenidades) return [];
    
    if (Array.isArray(amenidades)) {
      return amenidades;
    }
    
    try {
      return typeof amenidades === 'string' ? JSON.parse(amenidades) : [];
    } catch (e) {
      console.error('Error parsing amenidades:', e);
      return [];
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleVolver}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-24 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-48 bg-slate-100 animate-pulse rounded-xl" />
          </div>
        ) : hasError ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error al cargar los datos del desarrollo</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleRefresh}
            >
              Intentar de nuevo
            </Button>
          </div>
        ) : desarrollo ? (
          <>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-slate-800">{desarrollo.nombre}</h1>
                  <div className="flex items-center text-slate-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{desarrollo.ubicacion}</span>
                  </div>
                </div>
                <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                  getDesarrolloStatus(desarrollo).color
                }`}>
                  {getDesarrolloStatus(desarrollo).label}
                </div>
              </div>
              
              {/* Image Carousel Section */}
              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Imágenes del desarrollo
                  </h2>
                </div>
                <DesarrolloImageCarousel desarrolloId={id as string} editable={isAdmin()} />
              </div>
              
              {desarrollo.descripcion && (
                <p className="text-slate-700 mt-4">{desarrollo.descripcion}</p>
              )}
              
              {/* Amenidades section */}
              {desarrollo.amenidades && parseAmenidades(desarrollo.amenidades).length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold flex items-center mb-4">
                    <Package className="h-5 w-5 mr-2 text-indigo-600" />
                    Amenidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {parseAmenidades(desarrollo.amenidades).map((amenidad, index) => (
                      <Badge key={index} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                        {amenidad}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg mt-6">
                <div className="space-y-1">
                  <div className="flex items-center text-slate-500 text-sm">
                    <Home className="h-4 w-4 mr-1" />
                    <span>Unidades</span>
                  </div>
                  <p className="font-semibold">
                    {desarrollo.unidades_disponibles}/{desarrollo.total_unidades} disponibles
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-slate-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Inicio</span>
                  </div>
                  <p className="font-semibold">
                    {desarrollo.fecha_inicio 
                      ? new Date(desarrollo.fecha_inicio).toLocaleDateString('es-MX', {
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-slate-500 text-sm">
                    <CalendarClock className="h-4 w-4 mr-1" />
                    <span>Entrega</span>
                  </div>
                  <p className="font-semibold">
                    {desarrollo.fecha_entrega 
                      ? new Date(desarrollo.fecha_entrega).toLocaleDateString('es-MX', {
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Por definir'
                    }
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-slate-500 text-sm">
                    <span className="h-4 w-4 mr-1 flex items-center justify-center font-bold">%</span>
                    <span>Avance</span>
                  </div>
                  <p className="font-semibold">
                    {desarrollo.avance_porcentaje ?? 
                      Math.round((1 - desarrollo.unidades_disponibles / desarrollo.total_unidades) * 100)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-800">Prototipos disponibles</h2>
                  <p className="text-slate-600">
                    {prototipos.length} {prototipos.length === 1 ? 'prototipo' : 'prototipos'} en este desarrollo
                  </p>
                </div>
                <AdminResourceDialog 
                  resourceType="prototipos" 
                  buttonText="Nuevo prototipo" 
                  onSuccess={refetchPrototipos}
                  desarrolloId={id}
                />
              </div>
              
              {prototipos.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                  <Home className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-700 mb-4">No hay prototipos registrados en este desarrollo</p>
                  <AdminResourceDialog 
                    resourceType="prototipos" 
                    buttonText="Agregar prototipo" 
                    onSuccess={refetchPrototipos}
                    desarrolloId={id}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prototipos.map((prototipo) => (
                    <PrototipoCard key={prototipo.id} prototipo={prototipo} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

export default DesarrolloDetailPage;
