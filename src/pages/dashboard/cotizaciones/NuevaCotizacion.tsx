
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NuevaCotizacionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(true);
  
  // Get URL parameters if they exist
  const searchParams = new URLSearchParams(location.search);
  const unidadId = searchParams.get('unidad');
  const prototipoId = searchParams.get('prototipo');
  const desarrolloId = searchParams.get('desarrollo');
  
  // Default values for the quotation
  const [defaultValues, setDefaultValues] = useState<Record<string, any>>({});
  
  // Effect to get unit information if the ID exists
  useEffect(() => {
    const fetchUnidadData = async () => {
      if (!unidadId) return;
      
      try {
        // Here you would normally load unit data from Supabase
        // For now, we just set the prototype_id if it exists in the URL
        if (prototipoId) {
          setDefaultValues(prev => ({
            ...prev,
            prototipo_id: prototipoId
          }));
        }
        
        if (desarrolloId) {
          setDefaultValues(prev => ({
            ...prev,
            desarrollo_id: desarrolloId
          }));
        }
      } catch (error) {
        console.error('Error loading unit data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos de la unidad',
          variant: 'destructive',
        });
      }
    };
    
    fetchUnidadData();
  }, [unidadId, prototipoId, desarrolloId, toast]);
  
  // When the dialog closes, return to the list of quotations or to the previous page
  const handleDialogClose = () => {
    setDialogOpen(false);
    
    // If we come from a unit, we go back to the prototypes page
    if (unidadId || prototipoId) {
      navigate(-1);
    } else {
      navigate('/dashboard/cotizaciones');
    }
  };
  
  // When the quotation is saved, go back to the list
  const handleSuccess = () => {
    navigate('/dashboard/cotizaciones');
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">Nueva Cotización</h1>
          </div>
          <p className="text-slate-600">Crea una nueva cotización para un cliente</p>
        </div>
        
        {/* Show the resource dialog */}
        <AdminResourceDialog
          resourceType="cotizaciones"
          open={dialogOpen}
          onClose={handleDialogClose}
          onSuccess={handleSuccess}
          buttonText="Nueva Cotización"
          desarrolloId={desarrolloId || undefined}
          prototipo_id={prototipoId || undefined}
          defaultValues={defaultValues}
        />
      </div>
    </DashboardLayout>
  );
}
