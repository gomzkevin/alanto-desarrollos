import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Plus, FileText, Search, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useCotizaciones from '@/hooks/useCotizaciones';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { ExtendedCotizacion } from '@/hooks/useCotizaciones';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Lead } from '@/hooks/useLeads';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CotizacionDetailDialog from '@/components/dashboard/cotizaciones/CotizacionDetailDialog';
import { EditCotizacionButton } from '@/components/dashboard/EditCotizacionButton';

const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface CotizacionFormValues {
  isExistingClient: boolean;
  leadId?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito: boolean;
  monto_finiquito?: number;
  fecha_inicio_pagos?: Date;
  fecha_finiquito?: Date;
  notas?: string;
}

const CotizacionesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [showCotizacionDialog, setShowCotizacionDialog] = useState<boolean>(false);
  const [isExistingClient, setIsExistingClient] = useState<boolean>(false);
  const [searchLeadTerm, setSearchLeadTerm] = useState<string>('');
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [showLeadsDropdown, setShowLeadsDropdown] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('');
  
  const form = useForm<CotizacionFormValues>({
    defaultValues: {
      isExistingClient: false,
      monto_anticipo: 0,
      numero_pagos: 6,
      usar_finiquito: false,
      desarrollo_id: '',
      prototipo_id: '',
      fecha_inicio_pagos: new Date()
    }
  });
  
  const [selectedCotizacion, setSelectedCotizacion] = useState<ExtendedCotizacion | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState<boolean>(false);
  
  const { 
    cotizaciones = [], 
    isLoading, 
    error,
    refetch 
  } = useCotizaciones({ limit, withRelations: true });
  
  const { leads } = useLeads({ limit: 100 });
  const { desarrollos } = useDesarrollos({
    onSuccess: () => {},
    onError: (error) => console.error("Error fetching desarrollos:", error)
  });
  const { prototipos } = usePrototipos({ 
    desarrolloId: selectedDesarrolloId 
  });

  useEffect(() => {
    if (searchLeadTerm.trim() !== '') {
      const filtered = leads.filter(lead => 
        lead.nombre.toLowerCase().includes(searchLeadTerm.toLowerCase()) ||
        (lead.email && lead.email.toLowerCase().includes(searchLeadTerm.toLowerCase())) ||
        (lead.telefono && lead.telefono.toLowerCase().includes(searchLeadTerm.toLowerCase()))
      );
      setFilteredLeads(filtered);
    } else {
      setFilteredLeads([]);
    }
  }, [searchLeadTerm, leads]);

  useEffect(() => {
    if (selectedDesarrolloId) {
      form.setValue('prototipo_id', '');
    }
  }, [selectedDesarrolloId, form]);

  const handleNewCotizacion = () => {
    setShowCotizacionDialog(true);
    setIsExistingClient(false);
    setSelectedLead(null);
    setSelectedDesarrolloId('');
    form.reset({
      isExistingClient: false,
      monto_anticipo: 0,
      numero_pagos: 6,
      usar_finiquito: false,
      desarrollo_id: '',
      prototipo_id: '',
      fecha_inicio_pagos: new Date()
    });
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    form.setValue('leadId', lead.id);
    setShowLeadsDropdown(false);
    setSearchLeadTerm(lead.nombre);
  };

  const handleToggleExistingClient = (checked: boolean) => {
    setIsExistingClient(checked);
    form.setValue('isExistingClient', checked);
    if (checked) {
      form.setValue('nombre', undefined);
      form.setValue('email', undefined);
      form.setValue('telefono', undefined);
    } else {
      form.setValue('leadId', undefined);
      setSelectedLead(null);
      setSearchLeadTerm('');
    }
  };

  const handleSelectDesarrollo = (id: string) => {
    setSelectedDesarrolloId(id);
    form.setValue('desarrollo_id', id);
    form.setValue('prototipo_id', '');
  };

  const handleView = (cotizacionId: string) => {
    const cotizacion = cotizaciones.find(c => c.id === cotizacionId);
    if (cotizacion) {
      setSelectedCotizacion(cotizacion);
      setShowDetailDialog(true);
    } else {
      toast({
        title: "Error",
        description: "No se pudo encontrar la información de la cotización.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (cotizacionId: string) => {
    toast({
      title: "Función en desarrollo",
      description: "La eliminación de cotizaciones estará disponible próximamente.",
    });
  };

  const handleSubmitCotizacion = async (values: CotizacionFormValues) => {
    try {
      let leadId = values.leadId;
      
      if (!values.isExistingClient && values.nombre) {
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            nombre: values.nombre,
            email: values.email,
            telefono: values.telefono
          })
          .select()
          .single();
        
        if (leadError) {
          toast({
            title: 'Error',
            description: `No se pudo crear el lead: ${leadError.message}`,
            variant: 'destructive',
          });
          return;
        }
        
        leadId = newLead.id;
      }
      
      if (!leadId) {
        toast({
          title: 'Error',
          description: 'No se ha seleccionado o creado un cliente',
          variant: 'destructive',
        });
        return;
      }
      
      const { data: cotizacion, error: cotizacionError } = await supabase
        .from('cotizaciones')
        .insert({
          lead_id: leadId,
          desarrollo_id: values.desarrollo_id,
          prototipo_id: values.prototipo_id,
          monto_anticipo: values.monto_anticipo,
          numero_pagos: values.numero_pagos,
          usar_finiquito: values.usar_finiquito,
          monto_finiquito: values.monto_finiquito,
          notas: values.notas
        })
        .select();
      
      if (cotizacionError) {
        toast({
          title: 'Error',
          description: `No se pudo crear la cotización: ${cotizacionError.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Éxito',
        description: 'Cotización creada correctamente',
      });
      
      setShowCotizacionDialog(false);
      refetch();
      
    } catch (error) {
      console.error('Error al crear cotización:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar la solicitud',
        variant: 'destructive',
      });
    }
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
          
          <Dialog open={showCotizacionDialog} onOpenChange={setShowCotizacionDialog}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nueva Cotización</DialogTitle>
                <DialogDescription>
                  Ingresa los datos para la nueva cotización
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitCotizacion)} className="space-y-6">
                  <div className="flex items-center space-x-4 py-2">
                    <Label htmlFor="isExistingClient" className="flex-1">Cliente existente</Label>
                    <Switch 
                      id="isExistingClient" 
                      checked={isExistingClient}
                      onCheckedChange={handleToggleExistingClient}
                    />
                  </div>
                  
                  {isExistingClient ? (
                    <div className="relative">
                      <Label htmlFor="searchLead">Buscar cliente</Label>
                      <div className="relative">
                        <Input
                          id="searchLead"
                          placeholder="Buscar por nombre, email o teléfono"
                          value={searchLeadTerm}
                          onChange={(e) => {
                            setSearchLeadTerm(e.target.value);
                            setShowLeadsDropdown(true);
                          }}
                          className="w-full pr-10"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                      
                      {showLeadsDropdown && filteredLeads.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                          {filteredLeads.map((lead) => (
                            <div 
                              key={lead.id}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectLead(lead)}
                            >
                              <div className="font-medium">{lead.nombre}</div>
                              <div className="text-sm text-gray-500">
                                {lead.email || lead.telefono || "Sin datos de contacto"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {selectedLead && (
                        <div className="mt-2 p-2 border rounded-md bg-gray-50">
                          <div className="font-medium">{selectedLead.nombre}</div>
                          <div className="text-sm">
                            {selectedLead.email && <div>Email: {selectedLead.email}</div>}
                            {selectedLead.telefono && <div>Teléfono: {selectedLead.telefono}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del cliente</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nombre completo" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="correo@ejemplo.com" type="email" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+52 55 1234 5678" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-4">Datos de la cotización</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="desarrollo_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desarrollo</FormLabel>
                            <Select 
                              onValueChange={(value) => handleSelectDesarrollo(value)}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar desarrollo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {desarrollos.map((desarrollo) => (
                                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                                    {desarrollo.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="prototipo_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prototipo</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!selectedDesarrolloId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={
                                    selectedDesarrolloId 
                                      ? (prototipos.length > 0 
                                          ? "Seleccionar prototipo" 
                                          : "No hay prototipos disponibles")
                                      : "Seleccione un desarrollo primero"
                                  } />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {prototipos.map((prototipo) => (
                                  <SelectItem key={prototipo.id} value={prototipo.id}>
                                    {prototipo.nombre} - {formatter.format(prototipo.precio)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="monto_anticipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monto de anticipo</FormLabel>
                            <FormControl>
                              <Input 
                                formatCurrency
                                value={field.value}
                                onChange={(e) => {
                                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                  field.onChange(parseFloat(numericValue) || 0);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="numero_pagos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de pagos</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="fecha_inicio_pagos"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Fecha de inicio de pagos</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date(new Date().setHours(0, 0, 0, 0))
                                  }
                                  initialFocus
                                  locale={es}
                                />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="usar_finiquito"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Switch 
                                checked={field.value} 
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Usar finiquito</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch('usar_finiquito') && (
                      <div className="space-y-4 mt-4">
                        <FormField
                          control={form.control}
                          name="monto_finiquito"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Monto de finiquito</FormLabel>
                              <FormControl>
                                <Input 
                                  formatCurrency
                                  value={field.value}
                                  onChange={(e) => {
                                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                    field.onChange(parseFloat(numericValue) || 0);
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fecha_finiquito"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Fecha de finiquito</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", { locale: es })
                                      ) : (
                                        <span>Seleccionar fecha</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => {
                                      const startDate = form.watch('fecha_inicio_pagos');
                                      return startDate && date < startDate;
                                    }}
                                    initialFocus
                                    locale={es}
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="notas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notas</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCotizacionDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={
                        (!isExistingClient && !form.watch('nombre')) || 
                        (isExistingClient && !selectedLead) ||
                        !form.watch('desarrollo_id') ||
                        !form.watch('prototipo_id')
                      }
                    >
                      Guardar cotización
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Cliente</TableHead>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Desarrollo</TableHead>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Prototipo</TableHead>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Valor</TableHead>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Anticipo</TableHead>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Pagos</TableHead>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Fecha</TableHead>
                    <TableHead className="py-3 px-4 text-left font-medium text-slate-500">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(cotizaciones as ExtendedCotizacion[]).map((cotizacion) => (
                    <TableRow key={cotizacion.id} className="hover:bg-slate-50">
                      <TableCell className="py-3 px-4">
                        {cotizacion.lead ? (
                          <div>
                            <p className="font-medium">{cotizacion.lead.nombre}</p>
                            <p className="text-sm text-slate-500">{cotizacion.lead.email || cotizacion.lead.telefono || "Sin contacto"}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">ID: {cotizacion.lead_id}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {cotizacion.desarrollo ? cotizacion.desarrollo.nombre : cotizacion.desarrollo_id}
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        {cotizacion.prototipo ? cotizacion.prototipo.nombre : cotizacion.prototipo_id}
                      </TableCell>
                      <TableCell className="py-3 px-4 font-medium">
                        {cotizacion.prototipo ? (
                          formatter.format(cotizacion.prototipo.precio)
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="py-3 px-4">{formatter.format(cotizacion.monto_anticipo)}</TableCell>
                      <TableCell className="py-3 px-4">{cotizacion.numero_pagos}</TableCell>
                      <TableCell className="py-3 px-4">
                        {cotizacion.created_at
                          ? new Date(cotizacion.created_at).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(cotizacion.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          
                          <EditCotizacionButton
                            cotizacionId={cotizacion.id}
                            buttonVariant="outline"
                            buttonSize="sm"
                            onSuccess={refetch}
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(cotizacion.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        <CotizacionDetailDialog 
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          cotizacion={selectedCotizacion}
        />
      </div>
    </DashboardLayout>
  );
};

export default CotizacionesPage;

