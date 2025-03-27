import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import useVentas from '@/hooks/useVentas';
import { Venta } from '@/hooks/ventas/types';

const formSchema = z.object({
  precio_total: z.number().min(0, {
    message: "El precio total debe ser mayor o igual a 0.",
  }),
  es_fraccional: z.boolean().default(false),
});

interface VentaEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venta: Venta;
  onSuccess?: () => void;
}

export const VentaEditDialog: React.FC<VentaEditDialogProps> = ({
  open,
  onOpenChange,
  venta,
  onSuccess,
}) => {
  const { updateVenta, isUpdating } = useVentas();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      precio_total: venta?.precio_total || 0,
      es_fraccional: venta?.es_fraccional || false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateVenta(venta.id, {
        precio_total: values.precio_total,
        es_fraccional: values.es_fraccional,
      });
      toast({
        title: "Venta actualizada.",
        description: "La información de la venta ha sido actualizada correctamente.",
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error al actualizar",
        description: "Hubo un error al actualizar la venta. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Venta</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
