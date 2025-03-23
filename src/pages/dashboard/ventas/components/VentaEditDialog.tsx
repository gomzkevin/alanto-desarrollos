
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useToast } from '@/hooks/use-toast';
import { useVentas } from '@/hooks/useVentas';
import { Textarea } from '@/components/ui/textarea';
import { VentaDetallada } from '@/hooks/types';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface VentaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaDetallada;
  onSuccess?: () => void;
}

export const VentaEditDialog = ({
  open,
  onOpenChange,
  venta,
  onSuccess
}: VentaEditDialogProps) => {
  const { toast } = useToast();
  const { updateVenta } = useVentas();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      precio_total: formatCurrency(venta.precio_total),
      notas: venta.notas || '',
    }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const updateData = {
        id: venta.id,
        precio_total: parseCurrency(data.precio_total),
        notas: data.notas
      };

      await updateVenta(updateData);
      
      toast({
        title: 'Venta actualizada',
        description: 'La información de la venta ha sido actualizada correctamente'
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la venta',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Venta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="precio_total">Precio Total</Label>
            <Input
              id="precio_total"
              {...register('precio_total', { required: 'El precio es requerido' })}
            />
            {errors.precio_total && (
              <p className="text-sm text-destructive">{errors.precio_total.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Notas adicionales sobre la venta"
              className="h-24"
            />
          </div>
          
          <DialogFooter className="px-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
