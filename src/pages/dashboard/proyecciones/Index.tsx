
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchFinancialConfig } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProyeccionView from './components/ProyeccionView';
import useSubscriptionGuard from '@/hooks/useSubscriptionGuard';

const ProyeccionesPage = () => {
  const { hasAccess, isLoading: isSubscriptionLoading } = useSubscriptionGuard();
  const [financialConfig, setFinancialConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFinancialConfig = async () => {
      try {
        // Fetch global configuration (no desarrollo_id)
        const config = await fetchFinancialConfig();
        setFinancialConfig(config);
      } catch (error) {
        console.error('Error al cargar configuración financiera:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la configuración financiera',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      loadFinancialConfig();
    }
  }, [hasAccess]);

  if (isSubscriptionLoading) {
    return <DashboardLayout>Cargando...</DashboardLayout>;
  }

  if (!hasAccess) {
    return null; // The subscription guard will redirect
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Proyecciones Financieras</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando configuración financiera...</p>
            </div>
          </div>
        ) : (
          <ProyeccionView initialConfig={financialConfig} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
