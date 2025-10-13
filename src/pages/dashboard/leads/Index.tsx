import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Eye, Plus, Building, Home } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { LeadWizard } from '@/components/dashboard/onboarding/lead/LeadWizard';
import { format } from 'date-fns';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { useUserRole } from '@/hooks';
import useUsuarios from '@/hooks/useUsuarios';

const getBadgeVariant = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'nuevo':
      return 'default';
    case 'seguimiento':
      return 'outline';
    case 'convertido':
      return 'secondary';
    case 'perdido':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [selectedEstado, setSelectedEstado] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { empresaId, isLoading: isUserLoading } = useUserRole();
  
  const { 
    leads, 
    isLoading, 
    refetch, 
    statusOptions, 
    getStatusLabel,
    getSubstatusLabel,
    getOriginLabel
  } = useLeads({
    estado: selectedEstado || undefined,
    search: debouncedSearchTerm.length > 2 ? debouncedSearchTerm : undefined,
    empresa_id: empresaId
  });
  
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos();
  const { usuarios } = useUsuarios();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setSelectedEstado(value === 'todos' ? null : value);
  };

  const handleViewDetails = (leadId: string) => {
    setSelectedLeadId(leadId);
    setOpen(true);
  };

  const formatInterest = (interesEn: string | null) => {
    if (!interesEn) return <span className="text-gray-400">-</span>;
    
    if (interesEn.startsWith('desarrollo:')) {
      const desarrolloId = interesEn.split(':')[1];
      const desarrollo = desarrollos.find(d => d.id === desarrolloId);
      
      return (
        <div className="flex items-center">
          <Building className="mr-2 h-4 w-4 text-indigo-600" />
          <span>{desarrollo?.nombre || 'Desarrollo no encontrado'}</span>
        </div>
      );
    } else if (interesEn.startsWith('prototipo:')) {
      const prototipoId = interesEn.split(':')[1];
      const prototipo = prototipos.find(p => p.id === prototipoId);
      const desarrollo = prototipo 
        ? desarrollos.find(d => d.id === prototipo.desarrollo_id) 
        : null;
      
      return (
        <div className="flex flex-col">
          <div className="flex items-center">
            <Home className="mr-2 h-4 w-4 text-sky-500" />
            <span>{prototipo?.nombre || 'Prototipo no encontrado'}</span>
          </div>
          {desarrollo && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Building className="mr-1 h-3 w-3 text-indigo-400" />
              <span>{desarrollo.nombre}</span>
            </div>
          )}
        </div>
      );
    }
    
    return interesEn;
  };

  const getAgenteNombre = (agenteId: string) => {
    const usuario = usuarios.find(u => u.id === agenteId);
    return usuario ? usuario.nombre : agenteId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Prospectos</h1>
            <p className="text-slate-600">Gestiona tus prospectos y su seguimiento</p>
          </div>
          
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
            setSelectedLeadId(null);
            setOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo prospecto
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10"
              placeholder="Buscar prospectos..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div>
            <Select onValueChange={handleFilterChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md shadow-sm">
          <h2 className="text-xl font-semibold p-4 border-b">Lista de Prospectos</h2>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Subestado</TableHead>
                <TableHead>Interés</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Último contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isLoading || isUserLoading) ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 w-32 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-48 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-40 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-100 rounded-md"></div></TableCell>
                  </TableRow>
                ))
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      {lead.nombre}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {lead.email && (
                          <div className="flex items-center text-sm">
                            <span className="mr-2">📧</span>
                            {lead.email}
                          </div>
                        )}
                        {lead.telefono && (
                          <div className="flex items-center text-sm">
                            <span className="mr-2">📱</span>
                            {lead.telefono}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(lead.estado as string)} className="font-medium">
                        {getStatusLabel(lead.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.subestado ? 
                        <span className="text-gray-600">{getSubstatusLabel(lead.estado, lead.subestado)}</span> : 
                        <span className="text-gray-400">No definido</span>
                      }
                    </TableCell>
                    <TableCell>
                      {formatInterest(lead.interes_en)}
                    </TableCell>
                    <TableCell>
                      {lead.agente ? 
                        <span className="text-gray-600">{getAgenteNombre(lead.agente)}</span> : 
                        <span className="text-gray-400">Sin asignar</span>
                      }
                    </TableCell>
                    <TableCell>
                      {lead.origen ? 
                        <span className="flex items-center">
                          {getOriginLabel(lead.origen)}
                        </span> : 
                        <span className="text-gray-400">-</span>
                      }
                    </TableCell>
                    <TableCell>
                      {lead.ultimo_contacto ? 
                        <span className="whitespace-nowrap">
                          {format(new Date(lead.ultimo_contacto), 'dd MMM yyyy')}
                        </span> : 
                        'N/A'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" 
                        onClick={() => handleViewDetails(lead.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No se encontraron prospectos que coincidan con tu búsqueda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedLeadId ? (
        // Edit existing lead - use AdminResourceDialog
        <AdminResourceDialog
          open={open}
          onClose={() => setOpen(false)}
          resourceType="leads"
          resourceId={selectedLeadId}
          onSuccess={() => {
            setOpen(false);
            refetch();
          }}
        />
      ) : (
        // Create new lead - use LeadWizard
        <LeadWizard
          open={open}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            refetch();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default LeadsPage;
