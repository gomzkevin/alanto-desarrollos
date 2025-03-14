
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { useToast } from "@/hooks/use-toast";

type ExportPDFButtonProps = {
  resourceName: string;
  resourceId?: string;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export const ExportPDFButton = ({ 
  resourceName, 
  resourceId,
  buttonText = "Exportar PDF", 
  variant = "outline",
  size = "default",
  className = ""
}: ExportPDFButtonProps) => {
  const { toast } = useToast();
  const { role } = useUserRole();
  
  // Admin and vendedor roles can export PDFs - show it regardless of permissions during development
  // Remove this check completely to always show the button during development
  const canExportPDF = true; // Force to true for development
  
  if (!canExportPDF) {
    return null;
  }
  
  const handleExport = () => {
    // In a future implementation, this would connect to a PDF generation service
    toast({
      title: "Función en desarrollo",
      description: `La exportación de ${resourceName} a PDF estará disponible próximamente.`,
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
