
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Plus, Filter, ArrowUpDown, Phone, Mail, 
  Calendar, Check, X, MoreHorizontal, User, Building
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

// Datos de ejemplo para leads
const leads = [
  {
    id: '1',
    nombre: 'María González',
    email: 'maria@example.com',
    telefono: '+52 55 1234 5678',
    interesEn: 'Torre Mirador - Unidad A1',
    origen: 'Sitio web',
    estado: 'nuevo',
    agente: 'Juan Pérez',
    fechaCreacion: '2023-10-15T10:30:00',
    ultimoContacto: '2023-10-15T10:30:00',
  },
  {
    id: '2',
    nombre: 'Carlos Ramírez',
    email: 'carlos@example.com',
    telefono: '+52 55 8765 4321',
    interesEn: 'Residencias Costa - Unidad C2',
    origen: 'Facebook',
    estado: 'seguimiento',
    agente: 'Ana López',
    fechaCreacion: '2023-10-10T15:45:00',
    ultimoContacto: '2023-10-14T11:20:00',
  },
  {
    id: '3',
    nombre: 'Laura Sánchez',
    email: 'laura@example.com',
    telefono: '+52 55 2468 1357',
    interesEn: 'Loft Urbano - Unidad B3',
    origen: 'Recomendación',
    estado: 'convertido',
    agente: 'Juan Pérez',
    fechaCreacion: '2023-09-25T09:15:00',
    ultimoContacto: '2023-10-12T16:30:00',
  },
  {
    id: '4',
    nombre: 'Roberto Torres',
    email: 'roberto@example.com',
    telefono: '+52 55 1357 2468',
    interesEn: 'Bosque Eleva - Unidad E4',
    origen: 'Instagram',
    estado: 'perdido',
    agente: 'Ana López',
    fechaCreacion: '2023-09-18T11:00:00',
    ultimoContacto: '2023-10-05T10:10:00',
  },
  {
    id: '5',
    nombre: 'Patricia Morales',
    email: 'patricia@example.com',
    telefono: '+52 55 9753 1246',
    interesEn: 'Torre Mirador - Unidad A3',
    origen: 'Sitio web',
    estado: 'seguimiento',
    agente: 'Carlos Rodríguez',
    fechaCreacion: '2023-10-08T14:20:00',
    ultimoContacto: '2023-10-13T09:45:00',
  },
];

const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState(leads);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Efecto para cargar datos
  useEffect(() => {
    // Aquí se cargarían los datos reales desde Supabase
    // const fetchLeads = async () => {
    //   const { data, error } = await supabase
    //     .from('leads')
    //     .select('*');
    //   
    //   if (data) setFilteredLeads(data);
    // };
    
    // fetchLeads();
    
    // Simular carga
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filtrar leads basado en el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLeads(leads);
    } else {
      const filtered = leads.filter(
        lead => 
          lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.interesEn.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLeads(filtered);
    }
  }, [searchTerm]);

  // Función para obtener el color de la insignia según el estado
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'nuevo':
        return 'default';
      case 'seguimiento':
        return 'outline';
      case 'convertido':
        return 'default';
      case 'perdido':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'seguimiento':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'convertido':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'perdido':
        return '';
      default:
        return '';
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'nuevo':
        return 'Nuevo';
      case 'seguimiento':
        return 'En seguimiento';
      case 'convertido':
        return 'Convertido';
      case 'perdido':
        return 'Perdido';
      default:
        return status;
    }
  };
  
  const handleCreate = () => {
    toast({
      title: "Próximamente",
      description: "La creación de leads estará disponible pronto.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Leads</h1>
            <p className="text-slate-600">Gestiona y da seguimiento a tus leads comerciales</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo lead
          </Button>
        </div>
        
        <Tabs defaultValue="todos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="nuevos">Nuevos</TabsTrigger>
            <TabsTrigger value="seguimiento">En seguimiento</TabsTrigger>
            <TabsTrigger value="convertidos">Convertidos</TabsTrigger>
            <TabsTrigger value="perdidos">Perdidos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos" className="space-y-6">
            {/* Filtros y buscador */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-10"
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Select>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrar por agente" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los agentes</SelectItem>
                    <SelectItem value="juan">Juan Pérez</SelectItem>
                    <SelectItem value="ana">Ana López</SelectItem>
                    <SelectItem value="carlos">Carlos Rodríguez</SelectItem>
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
                    <SelectItem value="antiguos">Más antiguos</SelectItem>
                    <SelectItem value="ultimoContacto">Último contacto</SelectItem>
                    <SelectItem value="nombre">Nombre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Lista de leads */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map((lead) => (
                  <Card key={lead.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6">
                        <div className="md:col-span-3 space-y-1">
                          <div className="flex items-start space-x-2">
                            <User className="h-5 w-5 text-slate-400 mt-0.5" />
                            <div>
                              <p className="font-medium text-slate-900">{lead.nombre}</p>
                              <p className="text-sm text-slate-500">{lead.agente}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:col-span-3 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-slate-400" />
                            <p className="text-sm text-slate-600">{lead.interesEn}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <p className="text-xs text-slate-500">
                              {new Date(lead.fechaCreacion).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="md:col-span-3 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <p className="text-sm text-slate-600">{lead.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <p className="text-sm text-slate-600">{lead.telefono}</p>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 flex flex-col justify-between">
                          <Badge 
                            variant={getStatusBadgeVariant(lead.estado)}
                            className={getStatusBadgeClass(lead.estado)}
                          >
                            {getStatusText(lead.estado)}
                          </Badge>
                          <div className="text-xs text-slate-500 mt-2">
                            <span className="font-medium">Origen:</span> {lead.origen}
                          </div>
                        </div>
                        
                        <div className="md:col-span-1 flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                <span>Llamar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Enviar email</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Check className="mr-2 h-4 w-4" />
                                <span>Marcar como convertido</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <X className="mr-2 h-4 w-4" />
                                <span>Marcar como perdido</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {filteredLeads.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-slate-500">No se encontraron leads que coincidan con tu búsqueda.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Contenido para las otras pestañas */}
          <TabsContent value="nuevos" className="space-y-6">
            <p className="text-slate-500">Filtrando por leads nuevos.</p>
          </TabsContent>
          
          <TabsContent value="seguimiento" className="space-y-6">
            <p className="text-slate-500">Filtrando por leads en seguimiento.</p>
          </TabsContent>
          
          <TabsContent value="convertidos" className="space-y-6">
            <p className="text-slate-500">Filtrando por leads convertidos.</p>
          </TabsContent>
          
          <TabsContent value="perdidos" className="space-y-6">
            <p className="text-slate-500">Filtrando por leads perdidos.</p>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
