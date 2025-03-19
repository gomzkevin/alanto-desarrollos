
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

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
  cotizacionId = '',
  leadName = '',
  desarrolloNombre = '',
  prototipoNombre = '',
  disabled = false,
  variant = "outline",
  buttonText = "Exportar PDF",
  elementId,
  fileName,
  className = ""
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { userData } = useUserRole();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsGenerating(true);
      
      // Mock function for PDF generation
      // In a real implementation, this would call a PDF generation service
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "PDF generado con éxito",
        description: "El documento ha sido descargado.",
      });
    } catch (error: any) {
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
