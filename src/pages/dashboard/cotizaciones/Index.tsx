import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, AlertCircle, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/integrations/supabase/client';
import { useDesarrollos } from '@/hooks/useDesarrollos';
import { useUserRole } from '@/hooks/useUserRole';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RequireSubscription from '@/components/auth/RequireSubscription';
import CotizacionDialog from '@/components/dashboard/ResourceDialog/CotizacionDialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import useLeads from '@/hooks/useLeads';
import useCotizaciones from '@/hooks/useCotizaciones';

const CotizacionesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { empresaId } = useUserRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    cotizaciones,
    isLoading,
    error,
    refetch,
  } = useCotizaciones({ empresa_id: empresaId });

  const { leads } = useLeads({ empresa_id: empresaId });
  const { desarrollos } = useDesarrollos({ empresa_id: empresaId });

  const filteredCotizaciones = cotizaciones?.filter(cotizacion => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const leadName = leads?.find(l => l.id === cotizacion.lead_id)?.nombre?.toLowerCase() || '';
    const desarrolloName = desarrollos?.find(d => d.id === cotizacion.desarrollo_id)?.nombre?.toLowerCase() || '';
    
    return (
      leadName.includes(searchLower) ||
      desarrolloName.includes(searchLower) ||
      cotizacion.id.toLowerCase().includes(searchLower) ||
      (cotizacion.notas && cotizacion.notas.toLowerCase().includes(searchLower))
    );
  });

  const handleRowClick = (cotizacionId: string) => {
    navigate(`/dashboard/cotizaciones/${cotizacionId}`);
  };

  const getLeadName = (leadId: string) => {
    const lead = leads?.find(l => l.id === leadId);
    return lead ? lead.nombre : 'Cliente no encontrado';
  };

  const getDesarrolloName = (desarrolloId: string) => {
    const desarrollo = desarrollos?.find(d => d.id === desarrolloId);
    return desarrollo ? desarrollo.nombre : 'Desarrollo no encontrado';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendiente</Badge>;
      case 'aceptada':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aceptada</Badge>;
      case 'rechazada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rechazada</Badge>;
      case 'vencida':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Vencida</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RequireSubscription moduleName="Cotizaciones">
      <DashboardLayout>
        <div className="container py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Cotizaciones</h1>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Cotización
            </Button>
          </div>

          <div className="relative mt-4 mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por cliente, desarrollo o notas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Lista de Cotizaciones</CardTitle>
              <CardDescription>
                Administra tus cotizaciones y su información.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error.message || "Failed to fetch cotizaciones."}
                  </AlertDescription>
                </Alert>
              ) : filteredCotizaciones && filteredCotizaciones.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Desarrollo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCotizaciones.map((cotizacion) => (
                      <TableRow key={cotizacion.id} onClick={() => handleRowClick(cotizacion.id)} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">{getLeadName(cotizacion.lead_id)}</TableCell>
                        <TableCell>{getDesarrolloName(cotizacion.desarrollo_id)}</TableCell>
                        <TableCell>{formatCurrency(cotizacion.monto_total || 0)}</TableCell>
                        <TableCell>{getStatusBadge(cotizacion.estado || 'pendiente')}</TableCell>
                        <TableCell>{new Date(cotizacion.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sin Cotizaciones</AlertTitle>
                  <AlertDescription>
                    {searchTerm ? 'No se encontraron cotizaciones con ese criterio de búsqueda.' : 'No hay cotizaciones creadas aún.'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <CotizacionDialog
            open={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            onSuccess={() => {
              setIsDialogOpen(false);
              refetch();
              toast({
                title: "Cotización creada",
                description: "La cotización ha sido creada exitosamente"
              });
            }}
          />
        </div>
      </DashboardLayout>
    </RequireSubscription>
  );
};

export default CotizacionesPage;
