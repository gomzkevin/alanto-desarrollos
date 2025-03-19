
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { downloadQuotationPDF } from '@/utils/quotationPDF';

export interface ExportPDFButtonProps {
  cotizacionId?: string;
  leadName?: string;
  desarrolloNombre?: string;
  prototipoNombre?: string;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined;
  buttonText?: string;
  resourceName?: string;
  elementId?: string;
  fileName?: string;
  className?: string;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  cotizacionId,
  leadName = '',
  desarrolloNombre = '',
  prototipoNombre = '',
  disabled = false,
  variant = "outline",
  buttonText = "Exportar PDF",
  className = ""
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { userData } = useUserRole();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Get company name from userData
      const companyName = userData?.empresaNombre || 'AirbnbInvest';
      
      if (!cotizacionId || !leadName || !desarrolloNombre || !prototipoNombre) {
        console.error('Missing required parameters for PDF generation');
        toast({
          title: "Error al generar PDF",
          description: "Faltan parámetros requeridos para generar el PDF.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }
      
      await downloadQuotationPDF({
        clientName: leadName,
        propertyInfo: {
          desarrollo: desarrolloNombre,
          desarrollo_id: '', // This will be populated from backend
          prototipo: prototipoNombre,
          prototipo_id: '', // This will be populated from backend
          precio: 0 // This will be populated from backend
        },
        paymentInfo: {
          anticipoAmount: 0, // This will be populated from backend
          numberOfPayments: 0, // This will be populated from backend
          startDate: new Date(), // This will be populated from backend
          useFiniquito: false // This will be populated from backend
        }
      });
      
      toast({
        title: "PDF generado con éxito",
        description: "El documento ha sido descargado.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el documento. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant={variant as any}
      size="sm" 
      onClick={handleExport}
      disabled={disabled || isGenerating}
      className={className}
    >
      {isGenerating ? "Generando..." : <>{buttonText} <Download className="ml-2 h-4 w-4" /></>}
    </Button>
  );
};

export default ExportPDFButton;
