
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { generateCotizacionPDF } from '@/utils/quotationPDF';

interface ExportPDFButtonProps {
  cotizacionId: string;
  leadName: string;
  desarrolloNombre: string;
  prototipoNombre: string;
  disabled?: boolean;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  cotizacionId,
  leadName,
  desarrolloNombre,
  prototipoNombre,
  disabled = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { userData } = useUserRole();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Get company name from userData
      const companyName = userData?.empresaNombre || 'AirbnbInvest';
      
      await generateCotizacionPDF({
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
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={disabled || isGenerating}
    >
      {isGenerating ? "Generando..." : <>Exportar PDF <Download className="ml-2 h-4 w-4" /></>}
    </Button>
  );
};

export default ExportPDFButton;
