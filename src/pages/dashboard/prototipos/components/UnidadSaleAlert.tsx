
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface UnidadSaleAlertProps {
  isVisible: boolean;
  unidadId?: string;
  ventaId?: string | null;
  onClose: () => void;
}

export const UnidadSaleAlert: React.FC<UnidadSaleAlertProps> = ({
  isVisible,
  unidadId,
  ventaId,
  onClose
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10);
  
  // Reset timer when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(10);
      return;
    }
    
    console.log('Sale alert visible with ventaId:', ventaId, 'and unidadId:', unidadId);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-redirect when timer reaches zero
          if (ventaId) {
            navigate(`/dashboard/ventas/${ventaId}`);
            onClose();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isVisible, ventaId, navigate, onClose, unidadId]);
  
  if (!isVisible || !ventaId) return null;
  
  const handleGoToSale = () => {
    if (ventaId) {
      navigate(`/dashboard/ventas/${ventaId}`);
    }
    onClose();
  };
  
  return (
    <Alert 
      variant="default" 
      className="mb-4 border-green-200 bg-green-50 animate-in fade-in duration-200"
    >
      <AlertCircle className="h-4 w-4 text-green-500" />
      <AlertTitle>¡Venta creada automáticamente!</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Se ha creado automáticamente una venta asociada a esta unidad. 
          Puede continuar la gestión de la venta desde la sección de ventas.
        </p>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-muted-foreground">
            {timeLeft > 0 ? (
              `Se le redirigirá automáticamente en ${timeLeft} segundos`
            ) : (
              'Redirigiendo...'
            )}
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-green-500 text-green-700 hover:bg-green-50"
            onClick={handleGoToSale}
          >
            Ir a la venta 
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default UnidadSaleAlert;
