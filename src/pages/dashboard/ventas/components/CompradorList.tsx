
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CompradoresVenta } from '@/hooks/useVentas';
import CompradorDialog from './CompradorDialog';
import DeleteCompradorDialog from './DeleteCompradorDialog';

interface CompradorListProps {
  compradores: CompradoresVenta[];
  ventaId: string;
  esFraccional: boolean;
  precioTotal: number;
  onUpdateComprador: (params: { id: string; data: Partial<CompradoresVenta> }) => void;
  onDeleteComprador: (compradorId: string) => void;
  onCreateComprador: (data: Omit<CompradoresVenta, 'id' | 'created_at' | 'comprador' | 'vendedor' | 'pagos' | 'plan_pago' | 'total_pagado' | 'porcentaje_pagado'>) => void;
  isUpdating: boolean;
}

const CompradorList = ({
  compradores,
  ventaId,
  esFraccional,
  precioTotal,
  onUpdateComprador,
  onDeleteComprador,
  onCreateComprador,
  isUpdating
}: CompradorListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComprador, setSelectedComprador] = useState<CompradoresVenta | null>(null);

  // Validar que la suma de porcentajes no exceda 100%
  const currentTotalPorcentaje = compradores.reduce((sum, comprador) => 
    sum + comprador.porcentaje_propiedad, 0);
  
  const porcentajeDisponible = 100 - currentTotalPorcentaje;
  const canAddComprador = esFraccional && porcentajeDisponible > 0;

  const handleEditComprador = (comprador: CompradoresVenta) => {
    setSelectedComprador(comprador);
    setIsEditDialogOpen(true);
  };

  const handleDeleteComprador = (comprador: CompradoresVenta) => {
    setSelectedComprador(comprador);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitComprador = (data: Partial<CompradoresVenta>) => {
    if (selectedComprador) {
      // Actualizar comprador existente
      onUpdateComprador({
        id: selectedComprador.id,
        data
      });
      setIsEditDialogOpen(false);
      setSelectedComprador(null);
    } else {
      // Crear nuevo comprador
      onCreateComprador({
        venta_id: ventaId,
        comprador_id: data.comprador_id!,
        porcentaje_propiedad: data.porcentaje_propiedad!,
        vendedor_id: data.vendedor_id || null,
        monto_comprometido: data.monto_comprometido!
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedComprador) {
      onDeleteComprador(selectedComprador.id);
      setIsDeleteDialogOpen(false);
      setSelectedComprador(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Lista de Compradores
          {esFraccional && (
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-200">
              Venta Fraccional
            </Badge>
          )}
        </h3>
        {esFraccional && (
          <div className="text-sm text-muted-foreground">
            Porcentaje disponible: {porcentajeDisponible}%
          </div>
        )}
      </div>

      {compradores.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 border rounded-lg">
          <p className="text-muted-foreground mb-4">No hay compradores registrados</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Comprador
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comprador</TableHead>
                <TableHead>Contacto</TableHead>
                {esFraccional && <TableHead>Porcentaje</TableHead>}
                <TableHead>Monto Comprometido</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compradores.map(comprador => (
                <TableRow key={comprador.id}>
                  <TableCell className="font-medium">
                    {comprador.comprador?.nombre || 'Sin nombre'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{comprador.comprador?.email || 'Sin email'}</div>
                      <div>{comprador.comprador?.telefono || 'Sin teléfono'}</div>
                    </div>
                  </TableCell>
                  {esFraccional && (
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        {comprador.porcentaje_propiedad}%
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>{formatCurrency(comprador.monto_comprometido)}</TableCell>
                  <TableCell>{comprador.vendedor?.nombre || 'Sin asignar'}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatCurrency(comprador.total_pagado || 0)} 
                        <span className="text-xs text-muted-foreground ml-1">
                          ({Math.round(comprador.porcentaje_pagado || 0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${comprador.porcentaje_pagado || 0}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditComprador(comprador)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {esFraccional && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteComprador(comprador)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(compradores.length === 0 || canAddComprador) && (
        <div className="flex justify-end mt-4">
          <Button
            variant="default"
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!canAddComprador && compradores.length > 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Comprador
          </Button>
        </div>
      )}

      <CompradorDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleSubmitComprador}
        comprador={null}
        esFraccional={esFraccional}
        precioTotal={precioTotal}
        porcentajeDisponible={porcentajeDisponible}
        isLoading={isUpdating}
        titulo="Agregar Comprador"
      />

      <CompradorDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedComprador(null);
        }}
        onSubmit={handleSubmitComprador}
        comprador={selectedComprador}
        esFraccional={esFraccional}
        precioTotal={precioTotal}
        porcentajeDisponible={
          esFraccional && selectedComprador 
            ? porcentajeDisponible + selectedComprador.porcentaje_propiedad
            : porcentajeDisponible
        }
        isLoading={isUpdating}
        titulo="Editar Comprador"
      />

      <DeleteCompradorDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedComprador(null);
        }}
        onConfirm={handleConfirmDelete}
        comprador={selectedComprador}
        isLoading={isUpdating}
      />
    </div>
  );
};

export default CompradorList;
