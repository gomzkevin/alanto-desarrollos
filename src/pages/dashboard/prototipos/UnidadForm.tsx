
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UnidadFormProps {
  unidad?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  leads: any[];
}

export const UnidadForm = ({ unidad, onSubmit, onCancel, leads }: UnidadFormProps) => {
  const [estado, setEstado] = useState(unidad?.estado || 'disponible');
  const [fechaVenta, setFechaVenta] = useState<Date | undefined>(
    unidad?.fecha_venta ? new Date(unidad.fecha_venta) : undefined
  );
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      numero: unidad?.numero || '',
      nivel: unidad?.nivel || '',
      estado: unidad?.estado || 'disponible',
      precio_venta: unidad?.precio_venta || '',
      comprador_id: unidad?.comprador_id || '',
      comprador_nombre: unidad?.comprador_nombre || '',
      vendedor_id: unidad?.vendedor_id || '',
      vendedor_nombre: unidad?.vendedor_nombre || '',
      fecha_venta: unidad?.fecha_venta || ''
    }
  });
  
  const watchEstado = watch('estado');
  
  // Fetch sellers from the usuarios table
  useEffect(() => {
    const fetchVendedores = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('rol', 'vendedor')
          .eq('activo', true);
          
        if (error) throw error;
        setVendedores(data || []);
      } catch (error) {
        console.error('Error fetching vendedores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVendedores();
  }, []);
  
  useEffect(() => {
    // Update form values when date changes
    if (fechaVenta) {
      setValue('fecha_venta', fechaVenta.toISOString());
    } else {
      setValue('fecha_venta', '');
    }
  }, [fechaVenta, setValue]);
  
  useEffect(() => {
    // Update estado in form when it changes
    setValue('estado', estado);
  }, [estado, setValue]);
  
  const handleFormSubmit = (data: any) => {
    // Format data for submission
    const formattedData = {
      ...data,
      precio_venta: data.precio_venta ? parseFloat(data.precio_venta) : null,
      fecha_venta: fechaVenta ? fechaVenta.toISOString() : null
    };
    
    onSubmit(formattedData);
  };
  
  const handleLeadChange = (leadId: string) => {
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      setValue('comprador_id', selectedLead.id);
      setValue('comprador_nombre', selectedLead.nombre);
    }
  };
  
  const handleVendedorChange = (vendedorId: string) => {
    const selectedVendedor = vendedores.find(v => v.id === vendedorId);
    if (selectedVendedor) {
      setValue('vendedor_id', selectedVendedor.id);
      setValue('vendedor_nombre', selectedVendedor.nombre);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold mb-4">
        {unidad ? 'Editar Unidad' : 'Agregar Unidad'}
      </div>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número/Identificador *</Label>
            <Input
              id="numero"
              placeholder="Ej. A101, Casa 5, etc."
              {...register('numero', { required: true })}
              className={errors.numero ? 'border-red-500' : ''}
            />
            {errors.numero && (
              <p className="text-sm text-red-500">Este campo es requerido</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nivel">Nivel/Piso</Label>
            <Input
              id="nivel"
              placeholder="Ej. 1, PB, etc."
              {...register('nivel')}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estado">Estado *</Label>
          <Select
            value={estado}
            onValueChange={(value) => {
              setEstado(value);
              setValue('estado', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="apartado">Apartado</SelectItem>
              <SelectItem value="en_proceso">En Proceso</SelectItem>
              <SelectItem value="vendido">Vendido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(estado === 'apartado' || estado === 'en_proceso' || estado === 'vendido') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="precio_venta">Precio de Venta</Label>
              <Input
                id="precio_venta"
                type="number"
                placeholder="0.00"
                {...register('precio_venta')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comprador_id">Comprador</Label>
              <Select
                value={watch('comprador_id') || ''}
                onValueChange={handleLeadChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vendedor_id">Vendedor</Label>
              <Select
                value={watch('vendedor_id') || ''}
                onValueChange={handleVendedorChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {vendedores.map(vendedor => (
                    <SelectItem key={vendedor.id} value={vendedor.id}>
                      {vendedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Fecha de Venta/Apartado</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaVenta && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaVenta ? format(fechaVenta, 'PPP', { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaVenta}
                    onSelect={setFechaVenta}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {unidad ? 'Guardar Cambios' : 'Crear Unidad'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UnidadForm;
