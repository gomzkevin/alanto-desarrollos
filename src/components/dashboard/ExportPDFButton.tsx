
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { useToast } from "@/hooks/use-toast";

type ExportPDFButtonProps = {
  resourceName?: string;
  resourceId?: string;
  elementId?: string; // Para exportación de PDF desde un elemento DOM
  fileName?: string;  // Para nombre personalizado de archivo PDF
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export const ExportPDFButton = ({ 
  resourceName = "documento", 
  resourceId,
  elementId,
  fileName,
  buttonText = "Exportar PDF", 
  variant = "outline",
  size = "default",
  className = ""
}: ExportPDFButtonProps) => {
  const { toast } = useToast();
  const { role } = useUserRole();
  
  // Admin y vendedor pueden exportar PDFs - mostrar siempre durante desarrollo
  const canExportPDF = true; // Forzar a true para desarrollo
  
  if (!canExportPDF) {
    return null;
  }
  
  const handleExport = () => {
    // En una implementación futura, esto se conectaría a un servicio de generación de PDF
    toast({
      title: "Función en desarrollo",
      description: `La exportación de ${elementId ? fileName || "documento" : resourceName} a PDF estará disponible próximamente.`,
    });
  };
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleExport}
      className={className}
    >
      <FileText className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default ExportPDFButton;
