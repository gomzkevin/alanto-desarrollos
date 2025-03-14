
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

type ResourceType = 'desarrollo' | 'prototipo' | 'propiedad' | 'lead' | 'cotizacion';

type AdminResourceDialogProps = {
  resourceType: ResourceType;
  buttonText: string;
  buttonClassName?: string;
  onSuccess?: () => void;
};

export function AdminResourceDialog({ 
  resourceType, 
  buttonText, 
  buttonClassName,
  onSuccess 
}: AdminResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { canCreateResource } = useUserRole();
  
  // Placeholder for the future form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In the future, this will handle the actual resource creation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      
      toast({
        title: "Éxito",
        description: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} creado con éxito.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el ${resourceType}. Intente nuevamente.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nuevo {resourceType}</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo {resourceType}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {resourceType === 'desarrollo' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input id="nombre" placeholder="Nombre del desarrollo" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ubicacion" className="text-right">
                    Ubicación
                  </Label>
                  <Input id="ubicacion" placeholder="Ciudad, Estado" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="unidades" className="text-right">
                    Total unidades
                  </Label>
                  <Input id="unidades" type="number" min="1" placeholder="Número de unidades" className="col-span-3" required />
                </div>
              </>
            )}
            
            {resourceType === 'prototipo' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input id="nombre" placeholder="Nombre del prototipo" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Input id="tipo" placeholder="Tipo de prototipo" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="precio" className="text-right">
                    Precio
                  </Label>
                  <Input id="precio" type="number" min="1" placeholder="Precio de venta" className="col-span-3" required />
                </div>
              </>
            )}
            
            {resourceType === 'propiedad' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input id="nombre" placeholder="Nombre de la propiedad" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Input id="tipo" placeholder="Tipo de propiedad" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="precio" className="text-right">
                    Precio
                  </Label>
                  <Input id="precio" type="number" min="1" placeholder="Precio de venta" className="col-span-3" required />
                </div>
              </>
            )}
            
            {resourceType === 'lead' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre" className="text-right">
                    Nombre
                  </Label>
                  <Input id="nombre" placeholder="Nombre completo" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="correo@ejemplo.com" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="telefono" className="text-right">
                    Teléfono
                  </Label>
                  <Input id="telefono" placeholder="(123) 456 7890" className="col-span-3" />
                </div>
              </>
            )}
            
            {resourceType === 'cotizacion' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lead" className="text-right">
                    Lead
                  </Label>
                  <Input id="lead" placeholder="Nombre del lead" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="propiedad" className="text-right">
                    Propiedad
                  </Label>
                  <Input id="propiedad" placeholder="Propiedad" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="monto" className="text-right">
                    Monto
                  </Label>
                  <Input id="monto" type="number" min="1" placeholder="Monto total" className="col-span-3" required />
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
      </DialogContent>
    </Dialog>
  );
}

export default AdminResourceDialog;
