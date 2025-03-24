
import React, { useState, useEffect, useRef } from 'react';
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigatingRef = useRef(false);
  
  // Reset timer when visibility changes
  useEffect(() => {
    // Clear existing timer if any
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset state
    navigatingRef.current = false;
    
    if (!isVisible) {
      setTimeLeft(10);
      return;
    }
    
    console.log('Sale alert visible with ventaId:', ventaId, 'and unidadId:', unidadId);
    
    // Start a new timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Clean up timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          // Avoid navigation if already navigating
          if (!navigatingRef.current && ventaId) {
            navigatingRef.current = true;
            navigate(`/dashboard/ventas/${ventaId}`);
            onClose();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isVisible, ventaId, navigate, onClose, unidadId]);
  
  if (!isVisible || !ventaId) return null;
  
  const handleGoToSale = () => {
    // Avoid multiple clicks
    if (navigatingRef.current) return;
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Navigate to sale
    navigatingRef.current = true;
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
