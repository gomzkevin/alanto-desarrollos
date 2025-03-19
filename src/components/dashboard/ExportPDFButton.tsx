
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { generateQuotationPDF } from '@/utils/quotationPDF';

interface ExportPDFButtonProps {
  cotizacionId: string;
  leadName: string;
  desarrolloNombre: string;
  prototipoNombre: string;
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
  leadName,
  desarrolloNombre,
  prototipoNombre,
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
      
      await generateQuotationPDF({
        cotizacionId,
        leadName,
        desarrolloNombre,
        prototipoNombre,
        companyName
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
