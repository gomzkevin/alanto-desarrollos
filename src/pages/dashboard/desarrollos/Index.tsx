
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CalendarClock, Home, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Tipo para desarrollo
type Desarrollo = {
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

// Función para obtener todos los desarrollos
const fetchDesarrollos = async (): Promise<Desarrollo[]> => {
  const { data, error } = await supabase
    .from('desarrollos')
    .select('*');
  
  if (error) {
    console.error('Error fetching desarrollos:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

const DesarrollosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Usar React Query para obtener los desarrollos
  const { 
    data: desarrollos = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['desarrollos'],
    queryFn: fetchDesarrollos
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los desarrollos. Por favor, intenta de nuevo.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleNuevoDesarrollo = () => {
    toast({
      title: "Próximamente",
      description: "Esta funcionalidad estará disponible pronto.",
    });
  };

  const handleDesarrolloClick = (id: string) => {
    navigate(`/dashboard/desarrollos/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Desarrollos Inmobiliarios</h1>
            <p className="text-slate-600">Gestiona y monitorea tus desarrollos inmobiliarios</p>
          </div>
          <Button onClick={handleNuevoDesarrollo}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo desarrollo
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error al cargar desarrollos</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Intentar de nuevo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {desarrollos.map((desarrollo) => (
              <Card 
                key={desarrollo.id} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleDesarrolloClick(desarrollo.id)}
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-100">
                  {desarrollo.imagen_url ? (
                    <img
                      src={desarrollo.imagen_url}
                      alt={desarrollo.nombre}
                      className="h-full w-full object-cover"
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
                        {/* Placeholder for lead count */}
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
                    handleDesarrolloClick(desarrollo.id);
                  }}>
                    Ver detalles
                  </Button>
                  <Button variant="outline" size="sm" onClick={(e) => {
                    e.stopPropagation();
                    toast({
                      title: "Próximamente",
                      description: "Esta funcionalidad estará disponible pronto.",
                    });
                  }}>
                    Administrar leads
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DesarrollosPage;
