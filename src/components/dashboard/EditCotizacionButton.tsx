
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import useCotizaciones from "@/hooks/useCotizaciones";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { CotizacionEditForm } from "./ResourceDialog/components/CotizacionEditForm";

type EditCotizacionButtonProps = {
  cotizacionId: string;
  onSuccess?: () => void;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export const EditCotizacionButton = ({
  cotizacionId,
  onSuccess,
  buttonVariant = "outline",
  buttonSize = "sm",
  className = ""
}: EditCotizacionButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cotizacionData, setCotizacionData] = useState<any>(null);
  const { toast } = useToast();
  const { refetch } = useCotizaciones();
  
  const fetchCotizacionData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cotizaciones')
        .select(`
          *,
          lead:leads(id, nombre, email, telefono),
          desarrollo:desarrollos(id, nombre),
          prototipo:prototipos(id, nombre, precio)
        `)
        .eq('id', cotizacionId)
        .single();
      
      if (error) throw error;
      setCotizacionData(data);
    } catch (error: any) {
      console.error('Error fetching cotización:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la cotización",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenDialog = async () => {
    await fetchCotizacionData();
    setIsDialogOpen(true);
  };
  
  const handleSuccess = () => {
    toast({
      title: "Cotización actualizada",
      description: "La cotización ha sido actualizada exitosamente."
    });
    
    // Refetch cotizaciones data
    refetch();
    
    // Call additional onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
    
    setIsDialogOpen(false);
  };
  
  const handleUpdateCotizacion = async (values: any) => {
    try {
      const updateData = {
        lead_id: values.leadId || values.lead_id,
        desarrollo_id: values.desarrollo_id,
        prototipo_id: values.prototipo_id,
        monto_anticipo: values.monto_anticipo,
        numero_pagos: values.numero_pagos,
        usar_finiquito: values.usar_finiquito,
        monto_finiquito: values.monto_finiquito,
        notas: values.notas,
        fecha_inicio_pagos: values.fecha_inicio_pagos,
        fecha_finiquito: values.fecha_finiquito
      };
      
      const { error } = await supabase
        .from('cotizaciones')
        .update(updateData)
        .eq('id', cotizacionId);
        
      if (error) throw error;
      
      handleSuccess();
    } catch (error: any) {
      console.error('Error updating cotización:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar la cotización: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleOpenDialog}
        className={className}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
      {isDialogOpen && cotizacionData && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-gray-200 shadow-md">
            <CotizacionEditForm 
              cotizacion={cotizacionData} 
              onSave={handleUpdateCotizacion} 
              onCancel={() => setIsDialogOpen(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default EditCotizacionButton;
