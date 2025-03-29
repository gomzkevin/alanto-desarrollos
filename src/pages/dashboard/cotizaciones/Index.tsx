import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CotizacionesTable from '@/components/dashboard/cotizaciones/CotizacionesTable';
import { CotizacionesStats } from '@/components/dashboard/cotizaciones/CotizacionesStats';
import { FilterBar } from '@/components/dashboard/cotizaciones/FilterBar';
import AdminCotizacionDialog from '@/components/dashboard/AdminCotizacionDialog';
import { Plus } from 'lucide-react';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import usePrototipos from '@/hooks/usePrototipos';
import { useDesarrollos } from '@/hooks/desarrollos';

const Index = () => {
  const [desarrolloId, setDesarrolloId] = useState<string | undefined>(undefined);
  const [prototipoId, setPrototipoId] = useState<string | undefined>(undefined);
  const { cotizaciones, isLoading, refetch } = useCotizaciones({ desarrolloId, prototipoId });
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ desarrolloId });

  useEffect(() => {
    refetch();
  }, [desarrolloId, prototipoId, refetch]);

  const handleDesarrolloChange = (desarrolloId: string | undefined) => {
    setDesarrolloId(desarrolloId);
    setPrototipoId(undefined);
  };

  const handlePrototipoChange = (prototipoId: string | undefined) => {
    setPrototipoId(prototipoId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
          <AdminCotizacionDialog 
            onSuccess={refetch}
            desarrolloId={desarrolloId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </AdminCotizacionDialog>
        </div>

        <CotizacionesStats cotizaciones={cotizaciones || []} isLoading={isLoading} />

        <div className="rounded-md border">
          <FilterBar
            desarrollos={desarrollos}
            prototipos={prototipos}
            onDesarrolloChange={handleDesarrolloChange}
            onPrototipoChange={handlePrototipoChange}
            selectedDesarrollo={desarrolloId}
            selectedPrototipo={prototipoId}
          />
          <CotizacionesTable cotizaciones={cotizaciones || []} isLoading={isLoading} refetch={refetch} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
