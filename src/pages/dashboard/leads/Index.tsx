import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { format } from 'date-fns';

const leads = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    telefono: '555-1234',
    interes_en: 'Departamento en CDMX',
    origen: 'Facebook Ads',
    estado: 'Nuevo',
    subestado: 'Interesado',
    agente: 'Ana Gómez',
    notas: 'Contactar la próxima semana',
    fecha_creacion: '2024-01-20',
    ultimo_contacto: '2024-01-22'
  },
  {
    id: '2',
    nombre: 'María López',
    email: 'maria.lopez@example.com',
    telefono: '555-5678',
    interes_en: 'Casa en Guadalajara',
    origen: 'Google Ads',
    estado: 'En Contacto',
    subestado: 'En Llamada',
    agente: 'Carlos Ruiz',
    notas: 'Enviar información detallada',
    fecha_creacion: '2024-02-10',
    ultimo_contacto: '2024-02-12'
  },
  {
    id: '3',
    nombre: 'Pedro Sánchez',
    email: 'pedro.sanchez@example.com',
    telefono: '555-9012',
    interes_en: 'Terreno en Monterrey',
    origen: 'Sitio Web',
    estado: 'Calificado',
    subestado: 'Cita Agendada',
    agente: 'Laura Torres',
    notas: 'Confirmar cita el viernes',
    fecha_creacion: '2024-03-01',
    ultimo_contacto: '2024-03-03'
  },
  {
    id: '4',
    nombre: 'Luisa Ramírez',
    email: 'luisa.ramirez@example.com',
    telefono: '555-3456',
    interes_en: 'Oficina en Querétaro',
    origen: 'LinkedIn',
    estado: 'Cerrado',
    subestado: 'Venta Concretada',
    agente: 'Jorge Vargas',
    notas: 'Documentación enviada',
    fecha_creacion: '2024-04-15',
    ultimo_contacto: '2024-04-17'
  },
  {
    id: '5',
    nombre: 'Sofía Castro',
    email: 'sofia.castro@example.com',
    telefono: '555-7890',
    interes_en: 'Local Comercial en Puebla',
    origen: 'Recomendación',
    estado: 'Descartado',
    subestado: 'No Interesado',
    agente: 'Elena Jiménez',
    notas: 'Sin interés en la oferta',
    fecha_creacion: '2024-05-01',
    ultimo_contacto: '2024-05-03'
  },
];

const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState(leads);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLeads(leads);
    } else {
      const filtered = leads.filter(
        lead => 
          lead.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLeads(filtered);
    }
  }, [searchTerm]);

  const handleEdit = (leadId: string) => {
    setSelectedLeadId(leadId);
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Leads</h1>
            <p className="text-slate-600">Gestiona los prospectos interesados en tus propiedades</p>
          </div>
          
          <AdminResourceDialog 
            resourceType="leads" 
            buttonText="Nuevo Lead" 
            onSuccess={() => {
              // Refresh data or update state
              alert('Lead creado con éxito!');
            }}
          />
        </div>
        
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
                  <SelectValue placeholder="Filtrar por estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="nuevo">Nuevo</SelectItem>
                <SelectItem value="en-contacto">En Contacto</SelectItem>
                <SelectItem value="calificado">Calificado</SelectItem>
                <SelectItem value="cerrado">Cerrado</SelectItem>
                <SelectItem value="descartado">Descartado</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Checkbox />
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Interés en</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Último Contacto</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="font-medium"><div className="h-4 w-4 bg-slate-100 rounded-full"></div></TableCell>
                    <TableCell><div className="h-4 w-32 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-48 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-40 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-32 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-8 bg-slate-100 rounded-md"></div></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <Checkbox id={lead.id} />
                      <Label htmlFor={lead.id} className="sr-only">
                        {lead.nombre}
                      </Label>
                    </TableCell>
                    <TableCell>{lead.nombre}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.telefono}</TableCell>
                    <TableCell>{lead.interes_en}</TableCell>
                    <TableCell>{lead.origen}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.estado}</Badge>
                    </TableCell>
                    <TableCell>{lead.agente}</TableCell>
                    <TableCell>{lead.ultimo_contacto ? format(new Date(lead.ultimo_contacto), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(lead.id)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Eliminar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            Ver detalles
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredLeads.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-slate-500">No se encontraron leads que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>

      <AdminResourceDialog
        open={open}
        onClose={() => setOpen(false)}
        resourceType="leads"
        resourceId={selectedLeadId}
        onSuccess={() => {
          // Refresh data or update state
          alert('Lead actualizado con éxito!');
        }}
      />
    </DashboardLayout>
  );
};

export default LeadsPage;
