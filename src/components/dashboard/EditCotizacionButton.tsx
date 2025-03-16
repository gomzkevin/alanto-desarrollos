
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import AdminResourceDialog from "./ResourceDialog/AdminResourceDialog";
import { useToast } from "@/hooks/use-toast";
import useCotizaciones from "@/hooks/useCotizaciones";

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
  const { toast } = useToast();
  const { refetch } = useCotizaciones();
  
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
  
  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsDialogOpen(true)}
        className={className}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
      {isDialogOpen && (
        <AdminResourceDialog
          resourceType="cotizaciones"
          resourceId={cotizacionId}
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default EditCotizacionButton;
