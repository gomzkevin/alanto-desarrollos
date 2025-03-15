
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';
import useLeads from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExportPDFButton } from '@/components/dashboard/ExportPDFButton';
import { Loader2, Mail, Phone, Calendar, Tag, Plus, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const LeadsPage = () => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { leads, isLoading, refetch } = useLeads();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const handleViewDetails = (leadId: string) => {
    setSelectedLeadId(leadId);
    setEditDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedLeadId(null);
  };
  
  const getStatusStyle = (status: string | null) => {
    switch(status) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800';
      case 'contactado':
        return 'bg-yellow-100 text-yellow-800';
      case 'interesado':
        return 'bg-purple-100 text-purple-800';
      case 'calificado':
        return 'bg-green-100 text-green-800';
      case 'negociacion':
        return 'bg-amber-100 text-amber-800';
      case 'convertido':
        return 'bg-emerald-100 text-emerald-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const capitalizeFirstLetter = (text: string | null) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Prospectos</h1>
            <p className="text-slate-600">Gestiona tus prospectos y su seguimiento</p>
          </div>
          
          <AdminResourceDialog 
            resourceType="leads" 
            buttonText="Nuevo prospecto" 
            onSuccess={refetch}
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Prospectos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">No hay prospectos registrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Último contacto</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.nombre}</TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {lead.email && (
                              <div className="flex items-center text-sm">
                                <Mail className="mr-2 h-3 w-3 text-slate-400" />
                                {lead.email}
                              </div>
                            )}
                            {lead.telefono && (
                              <div className="flex items-center text-sm">
                                <Phone className="mr-2 h-3 w-3 text-slate-400" />
                                {lead.telefono}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusStyle(lead.estado)}`}>
                            {capitalizeFirstLetter(lead.estado || 'Nuevo')}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.interes_en || '-'}</TableCell>
                        <TableCell>
                          {lead.origen && (
                            <div className="flex items-center">
                              <Tag className="mr-1 h-3 w-3 text-slate-400" />
                              {lead.origen}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-slate-400" />
                            {formatDate(lead.ultimo_contacto)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(lead.id)}
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog for editing lead details */}
      {editDialogOpen && (
        <AdminResourceDialog
          open={editDialogOpen}
          onClose={handleCloseDialog}
          resourceType="leads"
          resourceId={selectedLeadId || undefined}
          onSuccess={refetch}
        />
      )}
    </DashboardLayout>
  );
};

export default LeadsPage;
