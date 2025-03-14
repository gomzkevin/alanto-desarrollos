
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useDesarrollos from '@/hooks/useDesarrollos';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

type ResourceType = 'desarrollo' | 'prototipo' | 'propiedad' | 'lead' | 'cotizacion';

type AdminResourceDialogProps = {
  resourceType: ResourceType;
  buttonText: string;
  buttonClassName?: string;
  onSuccess?: () => void;
  desarrolloId?: string; // For creating prototipos within a desarrollo
};

export function AdminResourceDialog({ 
  resourceType, 
  buttonText, 
  buttonClassName,
  onSuccess,
  desarrolloId
}: AdminResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { canCreateResource } = useUserRole();
  const { desarrollos } = useDesarrollos();
  
  const form = useForm({
    defaultValues: getDefaultValues(resourceType, desarrolloId)
  });
  
  function getDefaultValues(type: ResourceType, desarrolloId?: string) {
    switch (type) {
      case 'desarrollo':
        return {
          nombre: '',
          ubicacion: '',
          total_unidades: 0,
          unidades_disponibles: 0,
          avance_porcentaje: 0,
          descripcion: '',
          fecha_inicio: '',
          fecha_entrega: ''
        };
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
        };
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
        };
      case 'lead':
        return {
          nombre: '',
          email: '',
          telefono: '',
          interes_en: '',
          origen: 'sitio web',
          estado: 'nuevo',
          notas: ''
        };
      case 'cotizacion':
        return {
          lead: '',
          propiedad: '',
          monto: 0,
          notas: ''
        };
      default:
        return {};
    }
  }
  
  // Submit form to Supabase
  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    
    try {
      // Determine which table to insert into based on resourceType
      const table = getTableNameForResource(resourceType);
      
      // Insert data into the appropriate table
      const { data, error } = await supabase
        .from(table)
        .insert(values)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Éxito",
        description: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} creado con éxito.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset(getDefaultValues(resourceType, desarrolloId));
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
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo {resourceType}</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo {resourceType}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              {resourceType === 'desarrollo' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="nombre" className="text-right">Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} id="nombre" placeholder="Nombre del desarrollo" className="col-span-3" required />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="ubicacion"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="ubicacion" className="text-right">Ubicación</FormLabel>
                          <FormControl>
                            <Input {...field} id="ubicacion" placeholder="Ciudad, Estado" className="col-span-3" required />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="total_unidades"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="total_unidades" className="text-right">Total unidades</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="total_unidades" 
                              type="number" 
                              min="1" 
                              placeholder="Número de unidades" 
                              className="col-span-3" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="unidades_disponibles"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="unidades_disponibles" className="text-right">Unidades disponibles</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="unidades_disponibles" 
                              type="number" 
                              min="0" 
                              placeholder="Unidades disponibles" 
                              className="col-span-3" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="avance_porcentaje"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="avance_porcentaje" className="text-right">% Avance</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="avance_porcentaje" 
                              type="number" 
                              min="0" 
                              max="100" 
                              placeholder="Porcentaje de avance" 
                              className="col-span-3" 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="fecha_inicio"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="fecha_inicio" className="text-right">Fecha inicio</FormLabel>
                          <FormControl>
                            <Input {...field} id="fecha_inicio" type="date" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="fecha_entrega"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="fecha_entrega" className="text-right">Fecha entrega</FormLabel>
                          <FormControl>
                            <Input {...field} id="fecha_entrega" type="date" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="descripcion" className="text-right">Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} id="descripcion" placeholder="Descripción del desarrollo" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {resourceType === 'prototipo' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="nombre" className="text-right">Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} id="nombre" placeholder="Nombre del prototipo" className="col-span-3" required />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="tipo" className="text-right">Tipo</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger id="tipo" className="col-span-3">
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
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  {!desarrolloId && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormField
                        control={form.control}
                        name="desarrollo_id"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-4 items-center gap-4">
                            <FormLabel htmlFor="desarrollo_id" className="text-right">Desarrollo</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value} 
                              >
                                <SelectTrigger id="desarrollo_id" className="col-span-3">
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
                            <FormMessage className="col-span-3 col-start-2" />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="precio" className="text-right">Precio</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="precio" 
                              type="number" 
                              min="1" 
                              placeholder="Precio de venta" 
                              className="col-span-3" 
                              required 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="superficie"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="superficie" className="text-right">Superficie m²</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="superficie" 
                              type="number" 
                              min="1" 
                              placeholder="Superficie en m²" 
                              className="col-span-3" 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="habitaciones"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="habitaciones" className="text-right">Habitaciones</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="habitaciones" 
                              type="number" 
                              min="0" 
                              placeholder="Número de habitaciones" 
                              className="col-span-3" 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="baños"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="baños" className="text-right">Baños</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="baños" 
                              type="number" 
                              min="0" 
                              placeholder="Número de baños" 
                              className="col-span-3" 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="total_unidades"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="total_unidades" className="text-right">Total unidades</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="total_unidades" 
                              type="number" 
                              min="1" 
                              placeholder="Número total de unidades" 
                              className="col-span-3" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="unidades_disponibles"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="unidades_disponibles" className="text-right">Unidades disponibles</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="unidades_disponibles" 
                              type="number" 
                              min="0" 
                              placeholder="Unidades disponibles" 
                              className="col-span-3" 
                              required 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="descripcion" className="text-right">Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} id="descripcion" placeholder="Descripción del prototipo" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {resourceType === 'propiedad' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="nombre" className="text-right">Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} id="nombre" placeholder="Nombre de la propiedad" className="col-span-3" required />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="tipo" className="text-right">Tipo</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger id="tipo" className="col-span-3">
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
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="desarrollo_id"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="desarrollo_id" className="text-right">Desarrollo</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger id="desarrollo_id" className="col-span-3">
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
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="precio" className="text-right">Precio</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="precio" 
                              type="number" 
                              min="1" 
                              placeholder="Precio de venta" 
                              className="col-span-3" 
                              required 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="superficie"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="superficie" className="text-right">Superficie m²</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="superficie" 
                              type="number" 
                              min="1" 
                              placeholder="Superficie en m²" 
                              className="col-span-3" 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="habitaciones"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="habitaciones" className="text-right">Habitaciones</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="habitaciones" 
                              type="number" 
                              min="0" 
                              placeholder="Número de habitaciones" 
                              className="col-span-3" 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="baños"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="baños" className="text-right">Baños</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="baños" 
                              type="number" 
                              min="0" 
                              placeholder="Número de baños" 
                              className="col-span-3" 
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="estado" className="text-right">Estado</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger id="estado" className="col-span-3">
                                <SelectValue placeholder="Selecciona un estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="disponible">Disponible</SelectItem>
                                <SelectItem value="reservado">Reservado</SelectItem>
                                <SelectItem value="vendido">Vendido</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="descripcion" className="text-right">Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} id="descripcion" placeholder="Descripción de la propiedad" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {resourceType === 'lead' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="nombre" className="text-right">Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} id="nombre" placeholder="Nombre completo" className="col-span-3" required />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="email" className="text-right">Email</FormLabel>
                          <FormControl>
                            <Input {...field} id="email" type="email" placeholder="correo@ejemplo.com" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="telefono" className="text-right">Teléfono</FormLabel>
                          <FormControl>
                            <Input {...field} id="telefono" placeholder="(123) 456 7890" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="interes_en"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="interes_en" className="text-right">Interés en</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger id="interes_en" className="col-span-3">
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
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="origen"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="origen" className="text-right">Origen</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger id="origen" className="col-span-3">
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
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="estado" className="text-right">Estado</FormLabel>
                          <FormControl>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value} 
                            >
                              <SelectTrigger id="estado" className="col-span-3">
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
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="notas"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="notas" className="text-right">Notas</FormLabel>
                          <FormControl>
                            <Textarea {...field} id="notas" placeholder="Notas adicionales" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
              
              {resourceType === 'cotizacion' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="lead"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="lead" className="text-right">Lead</FormLabel>
                          <FormControl>
                            <Input {...field} id="lead" placeholder="Nombre del lead" className="col-span-3" required />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="propiedad"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="propiedad" className="text-right">Propiedad</FormLabel>
                          <FormControl>
                            <Input {...field} id="propiedad" placeholder="Propiedad" className="col-span-3" required />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="monto"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="monto" className="text-right">Monto</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              id="monto" 
                              type="number" 
                              min="1" 
                              placeholder="Monto total" 
                              className="col-span-3" 
                              required 
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormField
                      control={form.control}
                      name="notas"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-4 items-center gap-4">
                          <FormLabel htmlFor="notas" className="text-right">Notas</FormLabel>
                          <FormControl>
                            <Textarea {...field} id="notas" placeholder="Notas adicionales" className="col-span-3" />
                          </FormControl>
                          <FormMessage className="col-span-3 col-start-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
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
