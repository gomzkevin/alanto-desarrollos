
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import useCotizaciones from '@/hooks/useCotizaciones';
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';
import { ExtendedCotizacion } from '@/hooks/useCotizaciones';
import { ExportPDFButton } from '@/components/dashboard/ExportPDFButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const CotizacionesPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Diálogos
  const [showNewClientDialog, setShowNewClientDialog] = useState<boolean>(false);
  const [showSelectClientDialog, setShowSelectClientDialog] = useState<boolean>(false);
  const [showCotizacionDialog, setShowCotizacionDialog] = useState<boolean>(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  const { 
    cotizaciones = [], 
    isLoading, 
    error,
    refetch 
  } = useCotizaciones({ limit, withRelations: true });

  const handleNewCotizacion = () => {
    setShowNewClientDialog(true);
  };

  const handleSelectClient = () => {
    setShowNewClientDialog(false);
    setShowSelectClientDialog(true);
  };

  const handleNewClient = () => {
    setShowNewClientDialog(false);
    // Abrir diálogo para crear nuevo lead
    // Después de crear el lead, se debería abrir el diálogo de cotización
  };

  const handleLeadSelected = (leadId: string) => {
    setSelectedLeadId(leadId);
    setShowSelectClientDialog(false);
    setShowCotizacionDialog(true);
  };

  const handleCotizacionCreated = () => {
    setShowCotizacionDialog(false);
    setSelectedLeadId(null);
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Cotizaciones</h1>
            <p className="text-slate-600">Gestiona las cotizaciones generadas para tus clientes</p>
          </div>
          
          <Button onClick={handleNewCotizacion}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva cotización
          </Button>
          
          {/* Diálogo para elegir tipo de cliente */}
          <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nueva Cotización</DialogTitle>
                <DialogDescription>
                  Selecciona el tipo de cliente para la nueva cotización
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-4 py-4">
                <Button onClick={handleSelectClient} className="w-full">
                  Cliente existente
                </Button>
                <Button onClick={handleNewClient} variant="outline" className="w-full">
                  Nuevo cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Diálogo para seleccionar cliente existente */}
          <Dialog open={showSelectClientDialog} onOpenChange={setShowSelectClientDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Seleccionar Cliente</DialogTitle>
                <DialogDescription>
                  Elige un cliente existente para la nueva cotización
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <AdminResourceDialog 
                  resourceType="leads" 
                  buttonText="Nuevo cliente" 
                  onSuccess={() => {
                    setShowSelectClientDialog(false);
                    setShowCotizacionDialog(true);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Diálogo para crear cotización */}
          <AdminResourceDialog 
            resourceType="cotizaciones" 
            open={showCotizacionDialog}
            onClose={() => setShowCotizacionDialog(false)}
            onSuccess={handleCotizacionCreated}
            lead_id={selectedLeadId || undefined}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={es}
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
            
            <Input 
              type="search" 
              placeholder="Buscar cotización..." 
              className="max-w-md" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Label htmlFor="limit" className="text-sm font-medium text-slate-700">
              Mostrar:
            </Label>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-slate-500">Cargando cotizaciones...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error al cargar cotizaciones</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Intentar de nuevo
            </Button>
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className="text-center py-10">
            <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700 mb-4">No hay cotizaciones registradas</p>
            <Button onClick={handleNewCotizacion}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva cotización
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Cliente</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Desarrollo</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Prototipo</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Valor</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Anticipo</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Pagos</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Fecha</th>
                    <th className="py-3 px-4 text-left font-medium text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(cotizaciones as ExtendedCotizacion[]).map((cotizacion) => (
                    <tr key={cotizacion.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        {cotizacion.lead ? (
                          <div>
                            <p className="font-medium">{cotizacion.lead.nombre}</p>
                            <p className="text-sm text-slate-500">{cotizacion.lead.email || cotizacion.lead.telefono || "Sin contacto"}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">ID: {cotizacion.lead_id}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {cotizacion.desarrollo ? cotizacion.desarrollo.nombre : cotizacion.desarrollo_id}
                      </td>
                      <td className="py-3 px-4">
                        {cotizacion.prototipo ? cotizacion.prototipo.nombre : cotizacion.prototipo_id}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {cotizacion.prototipo ? (
                          formatter.format(cotizacion.prototipo.precio)
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3 px-4">{formatter.format(cotizacion.monto_anticipo)}</td>
                      <td className="py-3 px-4">{cotizacion.numero_pagos}</td>
                      <td className="py-3 px-4">
                        {cotizacion.created_at
                          ? new Date(cotizacion.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            Ver detalles
                          </Button>
                          <ExportPDFButton
                            resourceName="cotización"
                            resourceId={cotizacion.id}
                            size="sm"
                            variant="ghost"
                            buttonText="PDF"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CotizacionesPage;
