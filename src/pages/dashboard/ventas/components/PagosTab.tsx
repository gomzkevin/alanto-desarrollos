import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompradoresVenta, PlanPago, Pago } from '@/hooks/useVentas';
import PlanPagosForm from './PlanPagosForm';
import PagosTable from './PagosTable';
import PagoDialog from './PagoDialog';

interface PagosTabProps {
  compradores: CompradoresVenta[];
  esFraccional: boolean;
  ventaId: string;
  onCreatePago: (params: { compradorId: string; pagoData: Omit<Pago, 'id' | 'created_at' | 'comprador_venta_id'> }) => void;
  onUpdatePagoEstado: (params: { pagoId: string; estado: string }) => void;
  onUpsertPlanPago: (params: { compradorId: string; planData: Omit<PlanPago, 'id' | 'created_at' | 'comprador_venta_id'> }) => void;
  isUpdating: boolean;
}

const PagosTab = ({
  compradores,
  esFraccional,
  ventaId,
  onCreatePago,
  onUpdatePagoEstado,
  onUpsertPlanPago,
  isUpdating
}: PagosTabProps) => {
  const [selectedCompradorId, setSelectedCompradorId] = useState<string | null>(
    compradores.length > 0 ? compradores[0].id : null
  );
  const [isPagoDialogOpen, setIsPagoDialogOpen] = useState(false);

  // Encontrar el comprador seleccionado
  const selectedComprador = compradores.find(c => c.id === selectedCompradorId) || null;

  // Manejar cambio de comprador
  const handleCompradorChange = (compradorId: string) => {
    setSelectedCompradorId(compradorId);
  };

  // Manejar envío del plan de pagos
  const handlePlanPagosSubmit = (planData: Omit<PlanPago, 'id' | 'created_at' | 'comprador_venta_id'>) => {
    if (selectedCompradorId) {
      onUpsertPlanPago({
        compradorId: selectedCompradorId,
        planData
      });
    }
  };

  // Manejar envío de pago
  const handlePagoSubmit = (pagoData: Omit<Pago, 'id' | 'created_at' | 'comprador_venta_id'>) => {
    if (selectedCompradorId) {
      onCreatePago({
        compradorId: selectedCompradorId,
        pagoData
      });
      setIsPagoDialogOpen(false);
    }
  };

  // Si no hay compradores, mostrar mensaje
  if (compradores.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 border rounded-lg">
        <p className="text-muted-foreground">
          No hay compradores registrados para esta venta.
          Primero debe agregar compradores en la pestaña Compradores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Si es fraccional, mostrar selector de comprador */}
      {esFraccional && (
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-4 max-w-xl">
            {compradores.map(comprador => (
              <TabsTrigger
                key={comprador.id}
                value={comprador.id}
                onClick={() => handleCompradorChange(comprador.id)}
                className={selectedCompradorId === comprador.id
                  ? "bg-primary text-primary-foreground"
                  : ""}
              >
                {comprador.comprador?.nombre || 'Comprador'}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      )}

      {selectedComprador && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Plan de Pagos</h3>
            <div className="border rounded-lg p-4">
              <PlanPagosForm 
                comprador={selectedComprador}
                onSubmit={handlePlanPagosSubmit}
                isLoading={isUpdating}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pagos Registrados</h3>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={() => setIsPagoDialogOpen(true)}
              >
                Registrar Pago
              </button>
            </div>
            
            <PagosTable 
              pagos={selectedComprador.pagos || []}
              onUpdateEstado={onUpdatePagoEstado}
              isLoading={isUpdating}
            />
          </div>
        </div>
      )}

      <PagoDialog 
        isOpen={isPagoDialogOpen}
        onClose={() => setIsPagoDialogOpen(false)}
        onSubmit={handlePagoSubmit}
        comprador={selectedComprador}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default PagosTab;
