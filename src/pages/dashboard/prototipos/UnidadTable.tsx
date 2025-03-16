
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, FileText, BarChart3, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import useLeads from '@/hooks/useLeads';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

type Unidad = Tables<"unidades">;
type Prototipo = Tables<"prototipos">;

interface UnidadTableProps {
  unidades: Unidad[];
  isLoading: boolean;
  onRefresh: () => void;
  prototipo: Prototipo;
}

interface CotizacionFormValues {
  isExistingClient: boolean;
  leadId?: string;
  // Campos para nuevo lead
  nombre?: string;
  email?: string;
  telefono?: string;
  // Campos para cotización
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito: boolean;
  monto_finiquito?: number;
  notas?: string;
}

export function UnidadTable({ unidades, isLoading, onRefresh, prototipo }: UnidadTableProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedUnidad, setSelectedUnidad] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCotizacionDialog, setOpenCotizacionDialog] = useState(false);
  const [isExistingClient, setIsExistingClient] = useState<boolean>(false);
  const [searchLeadTerm, setSearchLeadTerm] = useState<string>('');
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [showLeadsDropdown, setShowLeadsDropdown] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  // Form for creating a quotation
  const form = useForm<CotizacionFormValues>({
    defaultValues: {
      isExistingClient: false,
      desarrollo_id: prototipo.desarrollo_id || '',
      prototipo_id: prototipo.id || '',
      monto_anticipo: 0,
      numero_pagos: 6,
      usar_finiquito: false,
    }
  });
  
  const { leads } = useLeads({ limit: 100 });
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ 
    desarrolloId: prototipo.desarrollo_id 
  });

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'apartado':
        return <Badge className="bg-yellow-100 text-yellow-800">Apartado</Badge>;
      case 'en_proceso':
        return <Badge className="bg-blue-100 text-blue-800">En proceso</Badge>;
      case 'en_pagos':
        return <Badge className="bg-purple-100 text-purple-800">En pagos</Badge>;
      case 'vendido':
        return <Badge className="bg-gray-100 text-gray-800">Vendido</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };
  
  const handleDelete = async () => {
    if (!selectedUnidad) return;
    
    try {
      const { error } = await supabase
        .from('unidades')
        .delete()
        .eq('id', selectedUnidad);
      
      if (error) throw error;
      
      toast({
        title: 'Unidad eliminada',
        description: 'La unidad ha sido eliminada correctamente',
      });
      
      // Actualizar unidades disponibles en el prototipo
      const unidad = unidades.find(u => u.id === selectedUnidad);
      if (unidad && unidad.estado === 'disponible' && prototipo.id) {
        await supabase
          .from('prototipos')
          .update({ 
            unidades_disponibles: (prototipo.unidades_disponibles || 0) - 1 
          })
          .eq('id', prototipo.id);
      }
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Error al eliminar la unidad: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedUnidad(null);
    }
  };
  
  const handleCotizacion = (unidadId: string) => {
    setSelectedUnidad(unidadId);
    setOpenCotizacionDialog(true);
    form.reset({
      isExistingClient: false,
      desarrollo_id: prototipo.desarrollo_id || '',
      prototipo_id: prototipo.id || '',
      monto_anticipo: 0,
      numero_pagos: 6,
      usar_finiquito: false,
    });
  };
  
  const handleProyeccion = (unidadId: string) => {
    // Navigate to projection page with unit ID
    navigate(`/dashboard/proyecciones?unidad=${unidadId}`);
  };

  const handleToggleExistingClient = (checked: boolean) => {
    setIsExistingClient(checked);
    form.setValue('isExistingClient', checked);
    // Clear related fields when switching
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

  const handleSelectLead = (lead: any) => {
    setSelectedLead(lead);
    form.setValue('leadId', lead.id);
    setShowLeadsDropdown(false);
    setSearchLeadTerm(lead.nombre);
  };

  const handleSubmitCotizacion = async (values: CotizacionFormValues) => {
    try {
      let leadId = values.leadId;
      
      // If it's a new client, create the lead first
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
            description: `No se pudo crear el cliente: ${leadError.message}`,
            variant: 'destructive',
          });
          return;
        }
        
        leadId = newLead.id;
      }
      
      // Verify that we have a leadId
      if (!leadId) {
        toast({
          title: 'Error',
          description: 'No se ha seleccionado o creado un cliente',
          variant: 'destructive',
        });
        return;
      }
      
      // Create the quotation
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
      
      setOpenCotizacionDialog(false);
      
    } catch (error: any) {
      console.error('Error al crear cotización:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error al procesar la solicitud',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full py-10">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  if (unidades.length === 0) {
    return (
      <div className="w-full rounded-md border border-dashed p-10 text-center">
        <h3 className="text-lg font-medium">No hay unidades</h3>
        <p className="text-sm text-gray-500 mt-1">
          No hay unidades registradas en este prototipo con los filtros seleccionados.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Comprador</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unidades.map((unidad) => (
              <TableRow key={unidad.id}>
                <TableCell className="font-medium">{unidad.numero}</TableCell>
                <TableCell>{unidad.nivel || '-'}</TableCell>
                <TableCell>{getEstadoBadge(unidad.estado)}</TableCell>
                <TableCell>{unidad.precio_venta ? formatCurrency(unidad.precio_venta) : '-'}</TableCell>
                <TableCell>{unidad.comprador_nombre || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUnidad(unidad.id);
                        setOpenEditDialog(true);
                      }}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    
                    {unidad.estado === 'disponible' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCotizacion(unidad.id)}
                        className="flex items-center gap-1"
                        type="button"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Cotizar</span>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProyeccion(unidad.id)}
                      type="button"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="sr-only">Proyección</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setSelectedUnidad(unidad.id);
                        setOpenDeleteDialog(true);
                      }}
                      type="button"
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
      
      {/* Diálogo para editar una unidad */}
      <AdminResourceDialog 
        resourceType="unidades"
        resourceId={selectedUnidad || undefined}
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedUnidad(null);
        }}
        onSuccess={onRefresh}
      />
      
      {/* Diálogo para confirmar eliminación */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta unidad
              del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para crear cotización - Reutilizando el mismo formato que en la sección de cotizaciones */}
      <Dialog open={openCotizacionDialog} onOpenChange={setOpenCotizacionDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Cotización</DialogTitle>
            <DialogDescription>
              Ingresa los datos para la nueva cotización
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitCotizacion)} className="space-y-6">
              {/* Selector de tipo de cliente */}
              <div className="flex items-center space-x-4 py-2">
                <FormLabel htmlFor="isExistingClient" className="flex-1">Cliente existente</FormLabel>
                <Switch 
                  id="isExistingClient" 
                  checked={isExistingClient}
                  onCheckedChange={handleToggleExistingClient}
                />
              </div>
              
              {/* Campos según tipo de cliente */}
              {isExistingClient ? (
                <div className="relative">
                  <FormLabel htmlFor="searchLead">Buscar cliente</FormLabel>
                  <div className="relative">
                    <Input
                      id="searchLead"
                      placeholder="Buscar por nombre, email o teléfono"
                      value={searchLeadTerm}
                      onChange={(e) => {
                        setSearchLeadTerm(e.target.value);
                        setShowLeadsDropdown(true);
                        
                        // Filter leads based on search term
                        if (e.target.value.trim() !== '') {
                          const filtered = leads.filter(lead => 
                            lead.nombre.toLowerCase().includes(e.target.value.toLowerCase()) ||
                            (lead.email && lead.email.toLowerCase().includes(e.target.value.toLowerCase())) ||
                            (lead.telefono && lead.telefono.toLowerCase().includes(e.target.value.toLowerCase()))
                          );
                          setFilteredLeads(filtered);
                        } else {
                          setFilteredLeads([]);
                        }
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
              
              {/* Campos para la cotización */}
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
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={true} // Disabled because it's pre-filled from the prototype
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
                          disabled={true} // Disabled because it's pre-filled from the prototype
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar prototipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {prototipos.map((proto) => (
                              <SelectItem key={proto.id} value={proto.id}>
                                {proto.nombre}
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
                            {...field} 
                            type="number" 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="monto_finiquito"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto de finiquito</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
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
                  onClick={() => setOpenCotizacionDialog(false)}
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
    </>
  );
}
