
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface UnidadEditDialogProps {
  open: boolean;
  onClose: () => void;
  unidadId: string;
  prototipo_id: string;
  onSuccess?: () => void;
}

type Unidad = Tables<"unidades">;

const unidadSchema = z.object({
  numero: z.string().min(1, 'El número es requerido'),
  nivel: z.string().optional(),
  estado: z.string(),
  precio_venta: z.coerce.number().optional(),
  comprador_nombre: z.string().optional(),
  comprador_id: z.string().optional(),
});

export const UnidadEditDialog = ({ 
  open, 
  onClose, 
  unidadId, 
  prototipo_id,
  onSuccess
}: UnidadEditDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: unidad, isLoading: isLoadingUnidad } = useQuery({
    queryKey: ['unidad', unidadId],
    queryFn: async () => {
      console.log('Fetching unidad with ID:', unidadId);
      const { data, error } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', unidadId)
        .single();
        
      if (error) {
        console.error('Error fetching unidad:', error);
        throw error;
      }
      
      console.log('Unidad data fetched:', data);
      return data as Unidad;
    },
    enabled: !!unidadId && open,
  });
  
  const { register, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<z.infer<typeof unidadSchema>>({
    resolver: zodResolver(unidadSchema),
    defaultValues: {
      numero: '',
      nivel: '',
      estado: 'disponible',
      precio_venta: undefined,
      comprador_nombre: '',
      comprador_id: '',
    }
  });
  
  // Actualizar form cuando se carga la unidad
  useEffect(() => {
    if (unidad) {
      reset({
        numero: unidad.numero || '',
        nivel: unidad.nivel || '',
        estado: unidad.estado || 'disponible',
        precio_venta: unidad.precio_venta || undefined,
        comprador_nombre: unidad.comprador_nombre || '',
        comprador_id: unidad.comprador_id || '',
      });
    }
  }, [unidad, reset]);
  
  const updateUnidad = useMutation({
    mutationFn: async (data: z.infer<typeof unidadSchema>) => {
      const { error } = await supabase
        .from('unidades')
        .update({
          ...data,
          prototipo_id,
        })
        .eq('id', unidadId);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipo_id] });
      queryClient.invalidateQueries({ queryKey: ['unidad', unidadId] });
      queryClient.invalidateQueries({ queryKey: ['prototipo', prototipo_id] });
      
      toast({
        title: 'Éxito',
        description: 'Unidad actualizada correctamente',
      });
      
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `No se pudo actualizar la unidad: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof unidadSchema>) => {
    setIsLoading(true);
    updateUnidad.mutate(data);
  };
  
  const currentEstado = watch('estado');
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Unidad {unidad?.numero}</DialogTitle>
        </DialogHeader>
        
        {isLoadingUnidad ? (
          <div className="py-6 flex justify-center">
            <div className="animate-pulse h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" {...register('numero')} />
                {errors.numero && <p className="text-xs text-red-500">{errors.numero.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nivel">Nivel</Label>
                <Input id="nivel" {...register('nivel')} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select 
                value={currentEstado}
                onValueChange={(value) => setValue('estado', value)}
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
            
            <div className="space-y-2">
              <Label htmlFor="precio_venta">Precio de Venta</Label>
              <Input 
                id="precio_venta" 
                type="number"
                {...register('precio_venta')} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comprador_nombre">Nombre del Comprador</Label>
              <Input 
                id="comprador_nombre" 
                {...register('comprador_nombre')} 
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || updateUnidad.isPending}>
                {isLoading || updateUnidad.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UnidadEditDialog;
