
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { exportToPDF } from "@/utils/exportToPDF";

type ExportPDFButtonProps = {
  resourceName?: string;
  resourceId?: string;
  elementId?: string; // Para exportación de PDF desde un elemento DOM
  fileName?: string;  // Para nombre personalizado de archivo PDF
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  cotizacionId?: string; // Prop for cotización ID
  showInListView?: boolean; // New prop to control visibility in list views
};

export const ExportPDFButton = ({ 
  resourceName = "documento", 
  resourceId,
  elementId,
  fileName,
  buttonText = "Exportar PDF", 
  variant = "outline",
  size = "default",
  className = "",
  cotizacionId,
  showInListView = false // Default to false - only show in detail views
}: ExportPDFButtonProps) => {
  const { toast } = useToast();
  const { userRole } = useUserRole(); // Using userRole instead of role
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin y vendedor pueden exportar PDFs - mostrar siempre durante desarrollo
  const canExportPDF = true; // Forzar a true para desarrollo
  
  if (!canExportPDF) {
    return null;
  }
  
  // If we're in a list view and showInListView is false, don't render the button
  if (!showInListView && !elementId && cotizacionId && !document.getElementById('cotizacion-detail-content')) {
    return null;
  }
  
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // For element export using our new utility
      if (elementId) {
        const pdfName = fileName || `${resourceName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}`;
        
        const success = await exportToPDF({
          elementId,
          fileName: pdfName,
          margins: { top: 10, right: 10, bottom: 10, left: 10 },
          quality: 2
        });
        
        if (success) {
          toast({
            title: "PDF generado exitosamente",
            description: `El ${resourceName} ha sido exportado a PDF.`
          });
        } else {
          toast({
            title: "Error al generar PDF",
            description: `Ocurrió un error al generar el PDF del ${resourceName}.`,
            variant: "destructive"
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      // Para cotizaciones, capturar el contenido de detalle
      if (cotizacionId) {
        // Verificar que estamos en la vista de detalle
        if (document.getElementById('cotizacion-detail-content')) {
          const pdfName = fileName || `Cotizacion_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}`;
          
          const success = await exportToPDF({
            elementId: 'cotizacion-detail-content',
            fileName: pdfName,
            margins: { top: 10, right: 10, bottom: 10, left: 10 },
            quality: 2
          });
          
          if (success) {
            toast({
              title: "PDF generado exitosamente",
              description: `La cotización ha sido exportada a PDF.`
            });
          } else {
            toast({
              title: "Error al generar PDF",
              description: `Ocurrió un error al generar el PDF de la cotización.`,
              variant: "destructive"
            });
          }
        } else {
          // Este caso no debería ocurrir ya que el botón no se renderiza en la vista de lista
          toast({
            title: "Ver detalles primero",
            description: "Para generar un PDF, por favor abra la vista detallada de la cotización primero.",
            variant: "destructive"
          });
        }
      } else {
        // For other resources without implementation yet
        toast({
          title: "Función en desarrollo",
          description: `La exportación de ${elementId ? fileName || "documento" : resourceName} a PDF estará disponible próximamente.`,
        });
      }
    } catch (error: any) {
      console.error('Error al exportar PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: error.message || `Ocurrió un error al generar el PDF del ${resourceName}.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleExport}
      className={className}
      disabled={isLoading}
    >
      <FileText className="mr-2 h-4 w-4" />
      {isLoading ? "Generando..." : buttonText}
    </Button>
  );
};

export default ExportPDFButton;
