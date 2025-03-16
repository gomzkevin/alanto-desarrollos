
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { useToast } from "@/hooks/use-toast";
import { downloadQuotationPDF } from "@/utils/quotationPDF";
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
  cotizacionId?: string; // New prop for cotización ID
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
      
      // Configuración para mejorar la calidad de la captura
      const options = {
        scale: 2, // Mayor escala para mejor calidad
        useCORS: true, // Para manejar imágenes con CORS
        logging: false, // Desactivar logs
        backgroundColor: '#ffffff' // Fondo blanco
      };
      
      const canvas = await html2canvas(element, options);
      
      // Calcular dimensiones manteniendo proporciones
      const imgWidth = 210; // Ancho A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Crear PDF con orientación vertical u horizontal según necesidad
      const orientation = imgHeight > 297 ? 'p' : 'l';
      const pdf = new jsPDF(orientation, 'mm', 'a4');
      
      // Añadir la imagen al PDF con máxima calidad
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      
      // Si el contenido es muy largo, dividir en múltiples páginas
      if (imgHeight > 297) {
        let heightLeft = imgHeight;
        let position = 0;
        
        heightLeft -= 297;
        position -= 297;
        
        while (heightLeft > 0) {
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
          position -= 297;
        }
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
  
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // Si se proporciona un elementId, capturar ese elemento
      if (elementId) {
        await captureElementAsPDF(elementId);
        setIsLoading(false);
        return;
      }
      
      if (cotizacionId) {
        // Export cotización as PDF - si no tiene elementId, usa el método anterior
        if (document.getElementById('cotizacion-detail-content')) {
          // Usar captura de pantalla si el elemento existe en el DOM
          await captureElementAsPDF('cotizacion-detail-content');
          setIsLoading(false);
          return;
        }
        
        // Si no hay elemento para capturar, usar el método original
        try {
          // Fetch cotización data
          const { data: cotizacion, error: cotizacionError } = await supabase
            .from('cotizaciones')
            .select(`
              *,
              lead:lead_id(nombre),
              desarrollo:desarrollo_id(nombre),
              prototipo:prototipo_id(nombre, precio)
            `)
            .eq('id', cotizacionId)
            .single();
          
          if (cotizacionError || !cotizacion) {
            throw new Error(cotizacionError?.message || 'No se pudo encontrar la cotización');
          }
          
          // Check for required data
          if (!cotizacion.lead || !cotizacion.desarrollo || !cotizacion.prototipo) {
            throw new Error('Faltan datos relacionados con la cotización');
          }
          
          // Extract necessary data
          const clientName = cotizacion.lead.nombre || 'Cliente';
          const propertyInfo = {
            desarrollo: cotizacion.desarrollo.nombre || 'Desarrollo',
            desarrollo_id: cotizacion.desarrollo_id || '',
            prototipo: cotizacion.prototipo.nombre || 'Prototipo',
            prototipo_id: cotizacion.prototipo_id || '',
            precio: cotizacion.prototipo.precio || 0
          };
          
          // Get payment start date or use current date
          let startDate = new Date();
          if (cotizacion.fecha_inicio_pagos) {
            startDate = new Date(cotizacion.fecha_inicio_pagos);
          }
          
          // Payment information
          const paymentInfo = {
            anticipoAmount: cotizacion.monto_anticipo || 0,
            numberOfPayments: cotizacion.numero_pagos || 1,
            startDate: startDate,
            useFiniquito: cotizacion.usar_finiquito || false,
            finiquitoAmount: cotizacion.monto_finiquito,
            finiquitoDate: cotizacion.fecha_finiquito ? new Date(cotizacion.fecha_finiquito) : undefined
          };
          
          // Generate and download PDF
          await downloadQuotationPDF(
            clientName,
            propertyInfo,
            paymentInfo,
            cotizacion.notas || undefined
          );
          
          toast({
            title: "PDF generado exitosamente",
            description: "La cotización ha sido exportada a PDF."
          });
        } catch (error: any) {
          console.error('Error al generar PDF:', error);
          toast({
            title: "Error al generar PDF",
            description: error.message || "Ocurrió un error al generar el PDF de la cotización.",
            variant: "destructive"
          });
        }
      } else {
        // For other resources or elements
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
