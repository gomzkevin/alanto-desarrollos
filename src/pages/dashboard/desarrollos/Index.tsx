
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, CalendarClock, Home, Users } from 'lucide-react';

// Datos de ejemplo para desarrollos
const desarrollos = [
  {
    id: '1',
    nombre: 'Torre Horizonte',
    ubicacion: 'Polanco, CDMX',
    estado: 'en_construccion',
    fechaEntrega: '2024-12-01',
    unidadesDisponibles: 48,
    unidadesTotales: 60,
    imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500',
    leads: 15
  },
  {
    id: '2',
    nombre: 'Oceana Residences',
    ubicacion: 'Playa del Carmen, Q.Roo',
    estado: 'en_construccion',
    fechaEntrega: '2025-03-15',
    unidadesDisponibles: 24,
    unidadesTotales: 40,
    imagen: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500',
    leads: 32
  },
  {
    id: '3',
    nombre: 'Bosque Vertical',
    ubicacion: 'Valle de Bravo, EdoMex',
    estado: 'terminado',
    fechaEntrega: '2023-10-01',
    unidadesDisponibles: 18,
    unidadesTotales: 24,
    imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500',
    leads: 8
  }
];

const DesarrollosPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleNuevoDesarrollo = () => {
    toast({
      title: "Próximamente",
      description: "Esta funcionalidad estará disponible pronto.",
    });
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {desarrollos.map((desarrollo) => (
              <Card key={desarrollo.id} className="overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={desarrollo.imagen}
                    alt={desarrollo.nombre}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{desarrollo.nombre}</h3>
                      <p className="text-sm text-slate-500">{desarrollo.ubicacion}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      desarrollo.estado === 'en_construccion' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {desarrollo.estado === 'en_construccion' ? 'En construcción' : 'Terminado'}
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
                        {new Date(desarrollo.fechaEntrega).toLocaleDateString('es-MX', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-500">
                        <Home className="h-4 w-4 mr-2" />
                        <span>Disponibilidad</span>
                      </div>
                      <p className="font-medium">
                        {desarrollo.unidadesDisponibles}/{desarrollo.unidadesTotales} unidades
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-500">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Leads activos</span>
                      </div>
                      <p className="font-medium">{desarrollo.leads} leads</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-500">
                        <span className="h-4 w-4 mr-2">%</span>
                        <span>Avance</span>
                      </div>
                      <p className="font-medium">
                        {Math.round((1 - desarrollo.unidadesDisponibles / desarrollo.unidadesTotales) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" size="sm">Ver detalles</Button>
                  <Button variant="outline" size="sm">Administrar leads</Button>
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
