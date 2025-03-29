
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { useVentas } from '@/hooks/useVentas';
import { formatCurrency } from '@/lib/utils';
import { VentaWithDetail } from '@/hooks/ventaDetail';

interface VentaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: VentaWithDetail;
  onSuccess?: () => void;
}

export const VentaEditDialog: React.FC<VentaEditDialogProps> = ({
  open,
  onOpenChange,
  venta,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateVenta } = useVentas();
  
  const form = useForm({
    defaultValues: {
      estado: venta.estado,
      precio_total: venta.precio_total,
      es_fraccional: venta.es_fraccional,
      notas: venta.notas || ''
    }
  });

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      await updateVenta.mutateAsync({
        id: venta.id,
        ...values
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating venta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Venta</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Estado de la venta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="precio_total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Total</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Precio total de la venta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="es_fraccional"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm">¿Es venta fraccional?</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Indica si la venta es fraccional o individual.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VentaEditDialog;
