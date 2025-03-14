
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AdminResourceDialog } from '@/components/dashboard/AdminResourceDialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import useUserRole from '@/hooks/useUserRole';

const CotizacionesPage = () => {
  const { canCreateResource } = useUserRole();

  const handleExportPDF = () => {
    alert('Exportar a PDF (función en desarrollo)');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Cotizaciones</h1>
            <p className="text-slate-600">Gestiona las cotizaciones enviadas a clientes potenciales</p>
          </div>
          <div className="flex gap-2">
            <AdminResourceDialog 
              resourceType="cotizacion" 
              buttonText="Nueva cotización" 
            />
            
            {canCreateResource('cotizacion') && (
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-slate-500">Esta sección está en construcción.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CotizacionesPage;
