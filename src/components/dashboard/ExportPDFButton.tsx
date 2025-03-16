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
  const { role } = useUserRole();
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
  
  const captureElementAsPDF = async (elementId: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`No se encontró el elemento con ID: ${elementId}`);
      }
      
      // Store original styles to restore later
      const originalStyles = {
        width: element.style.width,
        height: element.style.height,
        position: element.style.position,
        overflow: element.style.overflow,
      };
      
      // Create a direct clone for immediate DOM usage
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Apply styles to the cloned element
      clonedElement.style.backgroundColor = 'white';
      clonedElement.style.padding = '20px';
      clonedElement.style.borderRadius = '0';
      clonedElement.style.width = '800px'; // Fixed width for consistent capture
      clonedElement.style.maxWidth = '800px'; // Ensure consistent width
      
      // Position the clone off-screen but keep it in the normal document flow
      clonedElement.style.position = 'absolute';
      clonedElement.style.top = '-9999px';
      clonedElement.style.left = '-9999px';
      clonedElement.style.zIndex = '-1000';
      clonedElement.style.transform = 'none';
      
      // Important: append to body to ensure it's in the DOM hierarchy
      document.body.appendChild(clonedElement);
      
      // Force any responsive tables or grids to adjust to the new fixed width
      const tables = clonedElement.querySelectorAll('table');
      tables.forEach(table => {
        table.style.width = '100%';
        table.style.tableLayout = 'fixed';
      });
      
      // Force grid layouts to be single column for consistency
      const gridElements = clonedElement.querySelectorAll('[class*="grid-cols-"], [class*="lg:grid-cols-"]');
      gridElements.forEach(gridElement => {
        (gridElement as HTMLElement).style.display = 'block';
      });
      
      // Ensure all content is visible and not cut off
      clonedElement.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        element.style.overflow = 'visible';
      });
      
      // Wait for the clone to render fully
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Configuración para mejorar la calidad de la captura
      const options = {
        scale: 2, // Mayor escala para mejor calidad
        useCORS: true, // Para manejar imágenes con CORS
        logging: false, // Desactivar logs
        backgroundColor: '#ffffff', // Fondo blanco
        width: 800, // Fixed width to prevent responsive layout issues
        height: clonedElement.scrollHeight, // Adjust height to content
        windowWidth: 800, // Simulate consistent viewport width
        windowHeight: 10000, // Large enough to capture everything
        // Don't use iframe - directly use the cloned element to avoid cross-document issues
        foreignObjectRendering: false,
        ignoreElements: (element: Element) => {
          // Ignore fixed positioned elements that might cause duplications
          return window.getComputedStyle(element).position === 'fixed';
        }
      };
      
      try {
        // Capture the element directly without using iframe
        console.log("Capturing element with ID:", elementId);
        console.log("Cloned element is in DOM:", document.body.contains(clonedElement));
        
        const canvas = await html2canvas(clonedElement, options);
        
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
      } finally {
        // Always remove the cloned element from the DOM
        if (document.body.contains(clonedElement)) {
          document.body.removeChild(clonedElement);
          console.log("Cloned element removed from DOM");
        }
      }
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
  
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // Si se proporciona un elementId, capturar ese elemento
      if (elementId) {
        await captureElementAsPDF(elementId);
        setIsLoading(false);
        return;
      }
      
      // Para cotizaciones, capturar el contenido de detalle
      if (cotizacionId) {
        // Verificar que estamos en la vista de detalle
        const detailElement = document.getElementById('cotizacion-detail-content');
        if (detailElement) {
          await captureElementAsPDF('cotizacion-detail-content');
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
