
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import useUserRole from '@/hooks/useUserRole';
import { useToast } from "@/hooks/use-toast";
import { downloadQuotationPDF } from "@/utils/quotationPDF";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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
  
  const handleExport = async () => {
    if (cotizacionId) {
      // Export cotización as PDF
      try {
        setIsLoading(true);
        
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
      } finally {
        setIsLoading(false);
      }
    } else {
      // For other resources or elements
      toast({
        title: "Función en desarrollo",
        description: `La exportación de ${elementId ? fileName || "documento" : resourceName} a PDF estará disponible próximamente.`,
      });
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
