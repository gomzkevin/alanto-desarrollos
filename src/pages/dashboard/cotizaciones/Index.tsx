
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Plus, Filter, ArrowUpDown, FileText, User, 
  Calendar, Download, MoreHorizontal, Building
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Datos de ejemplo para cotizaciones
const cotizaciones = [
  {
    id: '1',
    codigo: 'COT-2023-001',
    cliente: 'María González',
    propiedad: 'Torre Mirador - Unidad A1',
    monto: 2850000,
    moneda: 'MXN',
    estado: 'vigente',
    fechaCreacion: '2023-10-15T10:30:00',
    fechaVencimiento: '2023-11-15T10:30:00',
    creadorPor: 'Juan Pérez',
  },
  {
    id: '2',
    codigo: 'COT-2023-002',
    cliente: 'Carlos Ramírez',
    propiedad: 'Residencias Costa - Unidad C2',
    monto: 4500000,
    moneda: 'MXN',
    estado: 'aprobada',
    fechaCreacion: '2023-10-10T15:45:00',
    fechaVencimiento: '2023-11-10T15:45:00',
    creadorPor: 'Ana López',
  },
  {
    id: '3',
    codigo: 'COT-2023-003',
    cliente: 'Laura Sánchez',
    propiedad: 'Loft Urbano - Unidad B3',
    monto: 3200000,
    moneda: 'MXN',
    estado: 'expirada',
    fechaCreacion: '2023-09-25T09:15:00',
    fechaVencimiento: '2023-10-25T09:15:00',
    creadorPor: 'Juan Pérez',
  },
  {
    id: '4',
    codigo: 'COT-2023-004',
    cliente: 'Roberto Torres',
    propiedad: 'Bosque Eleva - Unidad E4',
    monto: 3800000,
    moneda: 'MXN',
    estado: 'rechazada',
    fechaCreacion: '2023-09-18T11:00:00',
    fechaVencimiento: '2023-10-18T11:00:00',
    creadorPor: 'Ana López',
  }
];

const CotizacionesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCotizaciones, setFilteredCotizaciones] = useState(cotizaciones);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Efecto para cargar datos
  useEffect(() => {
    // Aquí se cargarían los datos reales desde Supabase
    // const fetchCotizaciones = async () => {
    //   const { data, error } = await supabase
    //     .from('cotizaciones')
    //     .select('*');
    //   
    //   if (data) setFilteredCotizaciones(data);
    // };
    
    // fetchCotizaciones();
    
    // Simular carga
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filtrar cotizaciones basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCotizaciones(cotizaciones);
    } else {
      const filtered = cotizaciones.filter(
        cotizacion => 
          cotizacion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cotizacion.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cotizacion.propiedad.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCotizaciones(filtered);
    }
  }, [searchTerm]);

  // Función para obtener el color de la insignia según el estado
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'vigente':
        return 'outline';
      case 'aprobada':
        return 'default';
      case 'expirada':
        return 'destructive';
      case 'rechazada':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'vigente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'aprobada':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'expirada':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
      case 'rechazada':
        return '';
      default:
        return '';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'vigente':
        return 'Vigente';
      case 'aprobada':
        return 'Aprobada';
      case 'expirada':
        return 'Expirada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return status;
    }
  };
  
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const handleCreate = () => {
    toast({
      title: "Próximamente",
      description: "La creación de cotizaciones estará disponible pronto.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Cotizaciones</h1>
            <p className="text-slate-600">Gestiona las cotizaciones enviadas a clientes</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva cotización
          </Button>
        </div>
        
        {/* Filtros y buscador */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Buscar cotizaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Select>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="vigente">Vigentes</SelectItem>
                <SelectItem value="aprobada">Aprobadas</SelectItem>
                <SelectItem value="expirada">Expiradas</SelectItem>
                <SelectItem value="rechazada">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select>
              <SelectTrigger>
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ordenar por" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recientes">Más recientes</SelectItem>
                <SelectItem value="vencimiento">Fecha de vencimiento</SelectItem>
                <SelectItem value="monto_desc">Monto (mayor a menor)</SelectItem>
                <SelectItem value="monto_asc">Monto (menor a mayor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Lista de cotizaciones */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCotizaciones.map((cotizacion) => (
                <Card key={cotizacion.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{cotizacion.codigo}</CardTitle>
                        <CardDescription>{cotizacion.propiedad}</CardDescription>
                      </div>
                      <Badge 
                        variant={getStatusBadgeVariant(cotizacion.estado)}
                        className={getStatusBadgeClass(cotizacion.estado)}
                      >
                        {getStatusText(cotizacion.estado)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium">{cotizacion.cliente}</p>
                            <p className="text-xs text-slate-500">Cliente</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {formatCurrency(cotizacion.monto, cotizacion.moneda)}
                          </p>
                          <p className="text-xs text-slate-500">Monto total</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Creación</p>
                            <p className="font-medium">
                              {new Date(cotizacion.fechaCreacion).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500">Vencimiento</p>
                            <p className="font-medium">
                              {new Date(cotizacion.fechaVencimiento).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="text-xs text-slate-500">
                      Creada por: {cotizacion.creadorPor}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Enviar por email</DropdownMenuItem>
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {filteredCotizaciones.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-500">No se encontraron cotizaciones que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CotizacionesPage;
