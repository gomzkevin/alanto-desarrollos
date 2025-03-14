
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';
import useLeads from '@/hooks/useLeads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExportPDFButton } from '@/components/dashboard/ExportPDFButton';
import { Loader2, Mail, Phone, Calendar, Tag, Plus } from 'lucide-react';

const LeadsPage = () => {
  const { leads, isLoading, refetch } = useLeads();
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                                <Mail className="mr-2 h-3 w-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.telefono && (
                              <div className="flex items-center text-sm">
                                <Phone className="mr-2 h-3 w-3" />
                                {lead.telefono}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.estado === 'nuevo' ? 'bg-blue-100 text-blue-800' :
                            lead.estado === 'contactado' ? 'bg-yellow-100 text-yellow-800' :
                            lead.estado === 'calificado' ? 'bg-green-100 text-green-800' :
                            lead.estado === 'perdido' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.estado?.charAt(0).toUpperCase() + (lead.estado?.slice(1) || '')}
                          </span>
                        </TableCell>
                        <TableCell>{lead.interes_en || '-'}</TableCell>
                        <TableCell>
                          {lead.origen && (
                            <div className="flex items-center">
                              <Tag className="mr-1 h-3 w-3" />
                              {lead.origen}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(lead.ultimo_contacto)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Ver detalles</Button>
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
    </DashboardLayout>
  );
};

export default LeadsPage;
