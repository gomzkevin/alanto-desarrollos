
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";

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
  cotizacionId
}: ExportPDFButtonProps) => {
  const { toast } = useToast();
  const { role } = useUserRole();
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin y vendedor pueden exportar PDFs - mostrar siempre durante desarrollo
  const canExportPDF = true; // Forzar a true para desarrollo
  
  if (!canExportPDF) {
    return null;
  }
  
  const captureElementAsPDF = async (elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`No se encontró el elemento con ID: ${elementId}`);
      }
      
      // Crear una copia del elemento para manipularlo sin afectar la visualización
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Aplicar estilos al clon para asegurar que se vea igual que en la pantalla
      clonedElement.style.backgroundColor = 'white';
      clonedElement.style.padding = '20px';
      clonedElement.style.borderRadius = '0';
      clonedElement.style.width = '800px'; // Ancho fijo para mejor control
      
      // Ocultar temporalmente el clon
      clonedElement.style.position = 'absolute';
      clonedElement.style.left = '-9999px';
      document.body.appendChild(clonedElement);
      
      // Configuración para mejorar la calidad de la captura
      const options = {
        scale: 2, // Mayor escala para mejor calidad
        useCORS: true, // Para manejar imágenes con CORS
        logging: false, // Desactivar logs
        backgroundColor: '#ffffff', // Fondo blanco
        width: 800, // Ancho fijo para garantizar consistencia
        height: clonedElement.scrollHeight, // Altura natural del contenido
        windowWidth: 800, // Simular un ancho de viewport consistente
        windowHeight: clonedElement.scrollHeight, // Simular altura basada en contenido
      };
      
      const canvas = await html2canvas(clonedElement, options);
      
      // Eliminar el clon después de capturarlo
      document.body.removeChild(clonedElement);
      
      // Calcular dimensiones manteniendo proporciones para una página A4
      const imgWidth = 210 - 40; // Ancho A4 en mm con márgenes de 20mm por lado
      const pageHeight = 297 - 40; // Altura A4 en mm con márgenes de 20mm arriba/abajo
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Crear PDF con orientación vertical
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Añadir la imagen al PDF con márgenes
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Posiciones iniciales con márgenes
      let position = 0;
      let heightLeft = imgHeight;
      
      // Añadir primera página
      pdf.addImage(imgData, 'JPEG', 20, 20, imgWidth, imgHeight);
      
      // Si el contenido es muy largo, dividir en múltiples páginas
      heightLeft = imgHeight - pageHeight;
      position = -(pageHeight);
      
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 20, position + 20, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        position -= pageHeight;
      }
      
      // Generar y descargar el PDF
      const pdfName = fileName || `${resourceName.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}`;
      pdf.save(`${pdfName}.pdf`);
      
      toast({
        title: "PDF generado exitosamente",
        description: `El ${resourceName} ha sido exportado a PDF.`
      });
      
      return true;
    } catch (error: any) {
      console.error('Error al generar PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: error.message || `Ocurrió un error al generar el PDF del ${resourceName}.`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const checkAndCaptureElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
      toast({
        title: "Ver detalles primero",
        description: "Para generar un PDF, por favor abra la vista detallada de la cotización primero.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };
  
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // Si se proporciona un elementId, verificar que existe antes de intentar capturarlo
      if (elementId) {
        if (checkAndCaptureElement(elementId)) {
          await captureElementAsPDF(elementId);
        }
        setIsLoading(false);
        return;
      }
      
      // Para cotizaciones, verificar que el elemento exista antes de capturar
      if (cotizacionId) {
        // Comprobar si existe el elemento de detalle de cotización
        if (document.getElementById('cotizacion-detail-content')) {
          await captureElementAsPDF('cotizacion-detail-content');
        } else {
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
