
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Venta } from '@/hooks/types';
import { useUpdateVenta } from '@/hooks/useVentas';
import { useToast } from '@/hooks/use-toast';

// Define form schema
const formSchema = z.object({
  precio_total: z.string().optional(),
  notas: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VentaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: Venta;
  onSuccess?: () => void;
}

export const VentaEditDialog = ({
  open,
  onOpenChange,
  venta,
  onSuccess,
}: VentaEditDialogProps) => {
  const { toast } = useToast();
  const updateVentaMutation = useUpdateVenta();
  const [isLoading, setIsLoading] = useState(false);
  
  const formatCurrency = (val: number) => `$${val.toLocaleString('es-MX')}`;
  const parseCurrency = (val: string) => {
    return Number(val.replace(/[^0-9.-]+/g, ''));
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      precio_total: formatCurrency(venta.precio_total || 0),
      notas: venta.notas || '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const updatedVenta = {
        id: venta.id,
        precio_total: parseCurrency(values.precio_total || '0'),
        notas: values.notas,
      };

      await updateVentaMutation.mutateAsync(updatedVenta);
      
      toast({
        title: "Venta actualizada",
        description: "La información de la venta ha sido actualizada exitosamente",
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating venta:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la venta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Venta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="precio_total" className="text-sm font-medium">
                Precio Total
              </label>
              <Input
                id="precio_total"
                {...register('precio_total')}
                placeholder="$0.00"
              />
              {errors.precio_total && (
                <p className="text-sm text-red-500">{errors.precio_total.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="notas" className="text-sm font-medium">
                Notas
              </label>
              <Input
                id="notas"
                {...register('notas')}
                placeholder="Agregar notas..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
