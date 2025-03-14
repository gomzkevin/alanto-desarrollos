
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import useDesarrollos from '@/hooks/useDesarrollos';
import useLeads from '@/hooks/useLeads';
import { Switch } from '@/components/ui/switch';
import { Tables } from '@/integrations/supabase/types';

type ResourceType = 'desarrollo' | 'prototipo' | 'propiedad' | 'lead' | 'cotizacion';

type AdminResourceDialogProps = {
  resourceType: ResourceType;
  buttonText: string;
  buttonClassName?: string;
  onSuccess?: () => void;
  desarrolloId?: string; // For creating prototipos within a desarrollo
};

// Define types for each resource
type DesarrolloFormValues = {
  nombre: string;
  ubicacion: string;
  total_unidades: number;
  unidades_disponibles: number;
  avance_porcentaje: number;
  descripcion: string;
  fecha_inicio: string;
  fecha_entrega: string;
};

type PrototipoFormValues = {
  nombre: string;
  tipo: string;
  precio: number;
  habitaciones: number;
  baños: number;
  superficie: number;
  total_unidades: number;
  unidades_disponibles: number;
  descripcion: string;
  desarrollo_id: string;
};

type PropiedadFormValues = {
  nombre: string;
  tipo: string;
  precio: number;
  superficie: number;
  habitaciones: number;
  baños: number;
  estado: string;
  descripcion: string;
  desarrollo_id: string;
};

type LeadFormValues = {
  nombre: string;
  email: string;
  telefono: string;
  interes_en: string;
  origen: string;
  estado: string;
  notas: string;
};

type CotizacionFormValues = {
  lead_id: string;
  lead_nombre?: string; // For display only
  desarrollo_id: string;
  prototipo_id: string;
  monto_anticipo: number;
  numero_pagos: number;
  usar_finiquito: boolean;
  monto_finiquito?: number;
  notas: string;
};

// Union type for all form values
type FormValues = 
  | DesarrolloFormValues 
  | PrototipoFormValues 
  | PropiedadFormValues 
  | LeadFormValues 
  | CotizacionFormValues;

export function AdminResourceDialog({ 
  resourceType, 
  buttonText, 
  buttonClassName,
  onSuccess,
  desarrolloId
}: AdminResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>(desarrolloId || '');
  const [availablePrototipos, setAvailablePrototipos] = useState<Tables<"prototipos">[]>([]);
  const { toast } = useToast();
  const { canCreateResource } = useUserRole();
  const { desarrollos } = useDesarrollos();
  const { leads } = useLeads();
  
  // State for conditional fields in cotización
  const [usarFiniquito, setUsarFiniquito] = useState(false);
  const [isNewLead, setIsNewLead] = useState(true);
  const [isExistingLeadSelected, setIsExistingLeadSelected] = useState(false);
  
  const getDefaultValues = (): any => {
    switch (resourceType) {
      case 'desarrollo':
        return {
          nombre: '',
          ubicacion: '',
          total_unidades: 0,
          unidades_disponibles: 0,
          avance_porcentaje: 0, // Default to 0 (pre-venta)
          descripcion: '',
          fecha_inicio: '',
          fecha_entrega: ''
        } as DesarrolloFormValues;
      case 'prototipo':
        return {
          nombre: '',
          tipo: '',
          precio: 0,
          habitaciones: 0,
          baños: 0,
          superficie: 0,
          total_unidades: 0,
          unidades_disponibles: 0,
          descripcion: '',
          desarrollo_id: desarrolloId || ''
        } as PrototipoFormValues;
      case 'propiedad':
        return {
          nombre: '',
          tipo: '',
          precio: 0,
          superficie: 0,
          habitaciones: 0,
          baños: 0,
          estado: 'disponible',
          descripcion: '',
          desarrollo_id: desarrolloId || ''
        } as PropiedadFormValues;
      case 'lead':
        return {
          nombre: '',
          email: '',
          telefono: '',
          interes_en: '',
          origen: 'sitio web',
          estado: 'nuevo',
          notas: ''
        } as LeadFormValues;
      case 'cotizacion':
        return {
          lead_id: '',
          lead_nombre: '',
          desarrollo_id: '',
          prototipo_id: '',
          monto_anticipo: 0,
          numero_pagos: 12,
          usar_finiquito: false,
          monto_finiquito: 0,
          notas: ''
        } as CotizacionFormValues;
      default:
        return {};
    }
  };
  
  const form = useForm({
    defaultValues: getDefaultValues()
  });
  
  // Load prototipos when desarrollo is selected for cotizaciones
  const handleDesarrolloChange = async (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
    
    if (desarrolloId) {
      try {
        const { data, error } = await supabase
          .from('prototipos')
          .select('*')
          .eq('desarrollo_id', desarrolloId);
          
        if (error) throw error;
        setAvailablePrototipos(data || []);
      } catch (error) {
        console.error('Error fetching prototipos:', error);
        setAvailablePrototipos([]);
      }
    } else {
      setAvailablePrototipos([]);
    }
  };
  
  // Handle lead selection or creation toggle
  const handleLeadSelectionChange = (isCreatingNew: boolean) => {
    setIsNewLead(isCreatingNew);
    form.setValue('lead_id', '');
    form.setValue('lead_nombre', '');
  };
  
  // Handle selecting an existing lead
  const handleLeadSelection = (leadId: string) => {
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      form.setValue('lead_id', selectedLead.id);
      form.setValue('lead_nombre', selectedLead.nombre);
      setIsExistingLeadSelected(true);
    }
  };
  
  // Submit form to Supabase
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Special case for cotizaciones
      if (resourceType === 'cotizacion') {
        const cotizacionValues = values as CotizacionFormValues;
        
        // If creating a new lead first
        if (isNewLead && !isExistingLeadSelected) {
          // Create lead first
          const leadData = {
            nombre: form.getValues('lead_nombre'),
            email: '',  // These fields would be added to the form
            telefono: '',
            estado: 'nuevo'
          };
          
          const { data: newLead, error: leadError } = await supabase
            .from('leads')
            .insert(leadData)
            .select()
            .single();
            
          if (leadError) throw leadError;
          
          // Then use the new lead's ID
          cotizacionValues.lead_id = newLead.id;
        }
        
        // Now create the cotización
        const { error: cotizacionError } = await supabase
          .from('cotizaciones')
          .insert({
            lead_id: cotizacionValues.lead_id,
            desarrollo_id: cotizacionValues.desarrollo_id,
            prototipo_id: cotizacionValues.prototipo_id,
            monto_anticipo: cotizacionValues.monto_anticipo,
            numero_pagos: cotizacionValues.numero_pagos,
            usar_finiquito: cotizacionValues.usar_finiquito,
            monto_finiquito: cotizacionValues.usar_finiquito ? cotizacionValues.monto_finiquito : null,
            notas: cotizacionValues.notas
          });
          
        if (cotizacionError) throw cotizacionError;
      } else {
        // Regular case for other resources
        const tableName = getTableNameForResource(resourceType);
        
        // Insert data into the appropriate table
        const { data, error } = await supabase
          .from(tableName)
          .insert(values)
          .select();
        
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Éxito",
        description: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} creado con éxito.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset(getDefaultValues());
      setOpen(false);
    } catch (error: any) {
      console.error(`Error creating ${resourceType}:`, error);
      toast({
        title: "Error",
        description: `No se pudo crear el ${resourceType}: ${error.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  function getTableNameForResource(type: ResourceType): string {
    switch (type) {
      case 'desarrollo': return 'desarrollos';
      case 'prototipo': return 'prototipos';
      case 'propiedad': return 'propiedades';
      case 'lead': return 'leads';
      case 'cotizacion': return 'cotizaciones';
      default: return '';
    }
  }
  
  // Don't render the button if user doesn't have permission
  if (!canCreateResource(resourceType)) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl">Crear nuevo {resourceType}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Completa la información para crear un nuevo {resourceType}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-5 py-2">
              {resourceType === 'desarrollo' && (
                <>
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del desarrollo" className="w-full" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ciudad, Estado" className="w-full" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="total_unidades"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total unidades</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              placeholder="Número de unidades" 
                              className="w-full" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unidades_disponibles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidades disponibles</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="Unidades disponibles" 
                              className="w-full" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="avance_porcentaje"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% Avance Comercial</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            max="100" 
                            placeholder="Porcentaje de avance" 
                            className="w-full" 
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fecha_inicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha inicio</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fecha_entrega"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha entrega</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descripción del desarrollo" className="w-full min-h-[120px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {resourceType === 'prototipo' && (
                <>
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del prototipo" className="w-full" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="departamento">Departamento</SelectItem>
                              <SelectItem value="casa">Casa</SelectItem>
                              <SelectItem value="villa">Villa</SelectItem>
                              <SelectItem value="local">Local comercial</SelectItem>
                              <SelectItem value="terreno">Terreno</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!desarrolloId && (
                    <FormField
                      control={form.control}
                      name="desarrollo_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desarrollo</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona un desarrollo" />
                              </SelectTrigger>
                              <SelectContent>
                                {desarrollos.map(desarrollo => (
                                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                                    {desarrollo.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              placeholder="Precio de venta" 
                              className="w-full" 
                              required 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="superficie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Superficie m²</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              placeholder="Superficie en m²" 
                              className="w-full" 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="habitaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habitaciones</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="Número de habitaciones" 
                              className="w-full" 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="baños"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Baños</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="Número de baños" 
                              className="w-full" 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="total_unidades"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total unidades</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              placeholder="Número total de unidades" 
                              className="w-full" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unidades_disponibles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidades disponibles</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="Unidades disponibles" 
                              className="w-full" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descripción del prototipo" className="w-full min-h-[120px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {resourceType === 'propiedad' && (
                <>
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre de la propiedad" className="w-full" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="departamento">Departamento</SelectItem>
                              <SelectItem value="casa">Casa</SelectItem>
                              <SelectItem value="villa">Villa</SelectItem>
                              <SelectItem value="local">Local comercial</SelectItem>
                              <SelectItem value="terreno">Terreno</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="desarrollo_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desarrollo</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un desarrollo" />
                            </SelectTrigger>
                            <SelectContent>
                              {desarrollos.map(desarrollo => (
                                <SelectItem key={desarrollo.id} value={desarrollo.id}>
                                  {desarrollo.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              placeholder="Precio de venta" 
                              className="w-full" 
                              required 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="superficie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Superficie m²</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="1" 
                              placeholder="Superficie en m²" 
                              className="w-full" 
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="habitaciones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Habitaciones</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="Número de habitaciones" 
                              className="w-full" 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="baños"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Baños</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              placeholder="Número de baños" 
                              className="w-full" 
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="disponible">Disponible</SelectItem>
                              <SelectItem value="reservado">Reservado</SelectItem>
                              <SelectItem value="vendido">Vendido</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descripción de la propiedad" className="w-full min-h-[120px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {resourceType === 'lead' && (
                <>
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre completo" className="w-full" required />
                        </FormControl>
                        <FormMessage />
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
                            <Input {...field} type="email" placeholder="correo@ejemplo.com" className="w-full" />
                          </FormControl>
                          <FormMessage />
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
                            <Input {...field} placeholder="(123) 456 7890" className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="interes_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interés en</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona interés" />
                            </SelectTrigger>
                            <SelectContent>
                              {desarrollos.map(desarrollo => (
                                <SelectItem key={desarrollo.id} value={desarrollo.nombre}>
                                  {desarrollo.nombre}
                                </SelectItem>
                              ))}
                              <SelectItem value="general">Información general</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="origen"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origen</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona origen" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sitio web">Sitio web</SelectItem>
                                <SelectItem value="referido">Referido</SelectItem>
                                <SelectItem value="llamada">Llamada</SelectItem>
                                <SelectItem value="redes sociales">Redes sociales</SelectItem>
                                <SelectItem value="evento">Evento</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nuevo">Nuevo</SelectItem>
                                <SelectItem value="contactado">Contactado</SelectItem>
                                <SelectItem value="calificado">Calificado</SelectItem>
                                <SelectItem value="negociando">Negociando</SelectItem>
                                <SelectItem value="cerrado">Cerrado</SelectItem>
                                <SelectItem value="perdido">Perdido</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notas adicionales" className="w-full min-h-[120px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {resourceType === 'cotizacion' && (
                <>
                  <div className="p-4 mb-4 bg-slate-50 rounded-lg">
                    <h3 className="font-medium mb-2">Información del Cliente</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <FormLabel>Tipo de cliente</FormLabel>
                        <div className="flex space-x-4 mt-2">
                          <Button 
                            type="button" 
                            variant={isNewLead ? "default" : "outline"}
                            onClick={() => handleLeadSelectionChange(true)}
                            className="w-full"
                          >
                            Nuevo cliente
                          </Button>
                          <Button 
                            type="button" 
                            variant={!isNewLead ? "default" : "outline"}
                            onClick={() => handleLeadSelectionChange(false)}
                            className="w-full"
                          >
                            Cliente existente
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {isNewLead ? (
                      <FormField
                        control={form.control}
                        name="lead_nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del cliente</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nombre completo" className="w-full" required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="lead_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seleccionar cliente</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  handleLeadSelection(value);
                                }} 
                                defaultValue={field.value} 
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccionar cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                  {leads.map(lead => (
                                    <SelectItem key={lead.id} value={lead.id}>
                                      {lead.nombre} {lead.telefono && `- ${lead.telefono}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <div className="p-4 mb-4 bg-slate-50 rounded-lg">
                    <h3 className="font-medium mb-2">Información de la propiedad</h3>
                    
                    <FormField
                      control={form.control}
                      name="desarrollo_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desarrollo</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleDesarrolloChange(value);
                              }} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona desarrollo" />
                              </SelectTrigger>
                              <SelectContent>
                                {desarrollos.map(desarrollo => (
                                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                                    {desarrollo.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="prototipo_id"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Prototipo</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              disabled={!selectedDesarrolloId}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona prototipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {availablePrototipos.map(prototipo => (
                                  <SelectItem key={prototipo.id} value={prototipo.id}>
                                    {prototipo.nombre} - ${prototipo.precio.toLocaleString()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="p-4 mb-4 bg-slate-50 rounded-lg">
                    <h3 className="font-medium mb-2">Plan de Pagos</h3>
                    
                    <FormField
                      control={form.control}
                      name="usar_finiquito"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mb-4">
                          <div className="space-y-0.5">
                            <FormLabel>Liquidar con finiquito</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                setUsarFiniquito(checked);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="monto_anticipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monto del anticipo</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                placeholder="Anticipo en pesos" 
                                className="w-full" 
                                required
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
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
                                min="1" 
                                placeholder="Número de pagos" 
                                className="w-full" 
                                required
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {usarFiniquito && (
                      <FormField
                        control={form.control}
                        name="monto_finiquito"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Monto del finiquito</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0" 
                                placeholder="Monto del finiquito o crédito" 
                                className="w-full" 
                                required
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas adicionales</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notas sobre la cotización" className="w-full min-h-[120px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AdminResourceDialog;
