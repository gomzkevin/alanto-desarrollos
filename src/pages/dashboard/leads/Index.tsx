import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Filter, ArrowUpDown, Search } from 'lucide-react';
import { LeadStatusBadge } from '@/components/dashboard/LeadStatusBadge';
import SyncResourcesButton from '@/components/dashboard/leads/SyncResourcesButton';
import ResourceDialog from '@/components/dashboard/ResourceDialog';
import useLeads from '@/hooks/useLeads';
import { formatDate } from '@/lib/utils';
import LeadTable from '@/components/dashboard/leads/LeadTable';
import { LEAD_ESTADOS } from '@/constants/leadEstados';
import LeadStatusCard from '@/components/dashboard/leads/LeadStatusCard';
import { useDesarrollos } from '@/hooks/desarrollos';

const Index = () => {
  const [open, setOpen] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'created_at' | 'nombre'>('created_at');
  const [desarrolloFilter, setDesarrolloFilter] = useState<string | undefined>(undefined);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { leads, isLoading, refetch } = useLeads({
    estado: estadoFilter,
    searchTerm: searchTerm,
    sortBy: sortBy,
    sortOrder: sortOrder,
    desarrolloId: desarrolloFilter
  });
  const { desarrollos } = useDesarrollos();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditDialogOpen(false);
    setSelectedLeadId(null);
    refetch();
  };

  const handleEdit = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsEditDialogOpen(true);
    setOpen(true);
  };

  const handleEstadoFilterChange = (estado: string | undefined) => {
    setEstadoFilter(estado);
  };

  const handleDesarrolloFilterChange = (desarrolloId: string | undefined) => {
    setDesarrolloFilter(desarrolloId);
  };

  const handleSortChange = (newSortBy: 'created_at' | 'nombre') => {
    setSortBy(newSortBy);
    setSortOrder(prevSortOrder => (sortBy === newSortBy ? (prevSortOrder === 'asc' ? 'desc' : 'asc') : 'asc'));
  };

  const sortedLeads = [...leads].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'nombre') {
      return a.nombre.localeCompare(b.nombre) * order;
    }
    return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Leads</h1>
          <div className="space-x-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <SyncResourcesButton />
            <Button onClick={handleOpen} className="border-2 border-gray-200 shadow-sm hover:bg-indigo-600">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Lead
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {LEAD_ESTADOS.map(estado => (
            <LeadStatusCard
              key={estado.value}
              estado={estado}
              count={leads.filter(lead => lead.estado === estado.value).length}
              onFilter={handleEstadoFilterChange}
            />
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros y búsqueda</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="col-span-1">
              <Input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={handleEstadoFilterChange} defaultValue={estadoFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Todos los estados</SelectItem>
                {LEAD_ESTADOS.map(estado => (
                  <SelectItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={handleDesarrolloFilterChange} defaultValue={desarrolloFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por desarrollo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={undefined}>Todos los desarrollos</SelectItem>
                {desarrollos.map(desarrollo => (
                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                    {desarrollo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <LeadTable
          leads={sortedLeads}
          isLoading={isLoading}
          sortOrder={sortOrder}
          sortBy={sortBy}
          onSort={handleSortChange}
          onEdit={handleEdit}
        />

        <ResourceDialog
          open={open}
          onClose={handleClose}
          resourceType="leads"
          resourceId={isEditDialogOpen ? selectedLeadId : undefined}
          onSuccess={refetch}
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
