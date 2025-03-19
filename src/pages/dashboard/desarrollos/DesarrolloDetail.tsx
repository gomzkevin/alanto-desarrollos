
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  ChevronLeft, 
  Home, 
  MapPin, 
  Clock, 
  CalendarClock, 
  ImageIcon, 
  Package,
  Bath, 
  Dumbbell, 
  Flame, 
  ParkingSquare, 
  Utensils, 
  Wifi, 
  Baby, 
  Lock, 
  Car, 
  Trees, 
  Waves, 
  GlassWater, 
  Check,
  PlusCircle 
} from 'lucide-react';
import PrototipoCard from '@/components/dashboard/PrototipoCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import usePrototipos from '@/hooks/usePrototipos';
import { Tables } from '@/integrations/supabase/types';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import DesarrolloImageCarousel from '@/components/dashboard/DesarrolloImageCarousel';
import DesarrolloEditButton from '@/components/dashboard/DesarrolloEditButton';
import { useUserRole } from '@/hooks';
import { Badge } from '@/components/ui/badge';
import useUnidades from '@/hooks/useUnidades';
import { Progress } from '@/components/ui/progress';
import useDesarrolloStats from '@/hooks/useDesarrolloStats';

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

const getAmenityIcon = (amenityId: string) => {
  const amenityMap: Record<string, { icon: React.ReactNode, label: string }> = {
    "pool": { icon: <Waves className="h-3.5 w-3.5 mr-1" />, label: "Alberca" },
    "gym": { icon: <Dumbbell className="h-3.5 w-3.5 mr-1" />, label: "Gimnasio" },
    "spa": { icon: <Bath className="h-3.5 w-3.5 mr-1" />, label: "Spa" },
    "bbq": { icon: <Flame className="h-3.5 w-3.5 mr-1" />, label: "Área de BBQ" },
    "playground": { icon: <Baby className="h-3.5 w-3.5 mr-1" />, label: "Área infantil" },
    "security": { icon: <Lock className="h-3.5 w-3.5 mr-1" />, label: "Seguridad 24/7" },
    "parking": { icon: <ParkingSquare className="h-3.5 w-3.5 mr-1" />, label: "Estacionamiento" },
    "garden": { icon: <Trees className="h-3.5 w-3.5 mr-1" />, label: "Jardín" },
    "beach": { icon: <Waves className="h-3.5 w-3.5 mr-1" />, label: "Playa" },
    "restaurant": { icon: <Utensils className="h-3.5 w-3.5 mr-1" />, label: "Restaurante" },
    "bar": { icon: <GlassWater className="h-3.5 w-3.5 mr-1" />, label: "Bar" },
    "wifi": { icon: <Wifi className="h-3.5 w-3.5 mr-1" />, label: "WiFi" }
  };

  return amenityMap[amenityId] || { icon: <Check className="h-3.5 w-3.5 mr-1" />, label: amenityId };
};

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

const DesarrolloDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { countDesarrolloUnidadesByStatus } = useUnidades();
  
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
  
  const { 
    data: desarrolloStats, 
    isLoading: isLoadingStats 
  } = useDesarrolloStats(id);
  
  const { 
    data: unitCounts,
    isLoading: isLoadingUnitCounts
  } = useQuery({
    queryKey: ['desarrollo-unit-counts', id],
    queryFn: () => countDesarrolloUnidadesByStatus(id as string),
    enabled: !!id,
  });
  
  const handleVolver = () => {
    navigate('/dashboard/desarrollos');
  };
  
  const handleRefresh = () => {
    refetchDesarrollo();
    refetchPrototipos();
  };
  
  const handlePrototipoClick = (prototipoId: string) => {
    navigate(`/dashboard/prototipos/${prototipoId}`);
  };
  
  const isLoading = isLoadingDesarrollo || isLoadingPrototipos || isLoadingUnitCounts || isLoadingStats;
  const hasError = errorDesarrollo || errorPrototipos;
  
  const calculateComercialProgress = () => {
    if (desarrolloStats) {
      return desarrolloStats.avanceComercial;
    }
    
    if (!unitCounts) return 0;
    
    const totalUnits = unitCounts.total || 0;
    const soldOrReserved = (unitCounts.vendidas || 0) + (unitCounts.con_anticipo || 0);
    
    if (totalUnits === 0) return 0;
    
    return Math.round((soldOrReserved / totalUnits) * 100);
  };
  
  const getUnitCountDisplay = () => {
    if (desarrolloStats) {
      return `${desarrolloStats.unidadesDisponibles}/${desarrolloStats.totalUnidades} disponibles`;
    }
    
    if (!unitCounts) return "0/0 disponibles";
    
    const availableUnits = unitCounts.disponibles || 0;
    const totalUnits = unitCounts.total || 0;
    
    return `${availableUnits}/${totalUnits} disponibles`;
  };
  
  const calcularUnidadesAsignadas = () => {
    if (!prototipos || prototipos.length === 0) return 0;
    return prototipos.reduce((sum, prototipo) => sum + (prototipo.total_unidades || 0), 0);
  };
  
  const puedeCrearPrototipos = () => {
    if (!desarrollo) return false;
    
    const unidadesAsignadas = calcularUnidadesAsignadas();
    const unidadesDesarrollo = desarrollo.total_unidades || 0;
    
    return unidadesAsignadas < unidadesDesarrollo;
  };
  
  const unidadesDisponiblesParaPrototipos = () => {
    if (!desarrollo) return 0;
    
    const unidadesAsignadas = calcularUnidadesAsignadas();
    const unidadesDesarrollo = desarrollo.total_unidades || 0;
    
    return Math.max(0, unidadesDesarrollo - unidadesAsignadas);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleVolver}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          
          {desarrollo && <DesarrolloEditButton desarrollo={desarrollo} onSuccess={handleRefresh} />}
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
              
              {desarrollo.amenidades && parseAmenidades(desarrollo.amenidades).length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold flex items-center mb-4">
                    <Package className="h-5 w-5 mr-2 text-indigo-600" />
                    Amenidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {parseAmenidades(desarrollo.amenidades).map((amenidadId, index) => {
                      const { icon, label } = getAmenityIcon(amenidadId);
                      return (
                        <Badge key={index} variant="amenity" className="flex items-center py-1">
                          {icon}
                          <span>{label}</span>
                        </Badge>
                      );
                    })}
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
                    {getUnitCountDisplay()}
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
                    <span>Avance Comercial</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{calculateComercialProgress()}%</p>
                    <Progress value={calculateComercialProgress()} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-800">Prototipos disponibles</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="text-slate-600">
                      {prototipos.length} {prototipos.length === 1 ? 'prototipo' : 'prototipos'} en este desarrollo
                    </p>
                    {puedeCrearPrototipos() && (
                      <div className="flex items-center text-indigo-600 gap-2">
                        <span>(Aún puedes crear prototipos para {unidadesDisponiblesParaPrototipos()} unidades más)</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                          onClick={() => {}}
                          asChild
                        >
                          <span className="flex items-center">
                            <PlusCircle className="h-3.5 w-3.5 mr-1" />
                            <AdminResourceDialog 
                              resourceType="prototipos" 
                              buttonText="Crear prototipo" 
                              buttonIcon={<PlusCircle className="h-4 w-4 mr-1" />}
                              buttonVariant="link"
                              onSuccess={refetchPrototipos}
                              desarrolloId={id}
                            />
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <AdminResourceDialog 
                  resourceType="prototipos" 
                  buttonText="Nuevo prototipo" 
                  buttonIcon={<PlusCircle className="h-4 w-4 mr-2" />}
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
                    buttonIcon={<PlusCircle className="h-4 w-4 mr-2" />}
                    onSuccess={refetchPrototipos}
                    desarrolloId={id}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {prototipos.map((prototipo) => (
                    <PrototipoCard 
                      key={prototipo.id} 
                      prototipo={prototipo}
                      onViewDetails={handlePrototipoClick}
                    />
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
