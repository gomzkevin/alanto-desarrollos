
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesarrollos } from '@/hooks/useDesarrollos';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFilter: (estado: string, desarrollo?: string) => void;
  currentFilter: string;
  currentDesarrolloId?: string;
}

const FilterDialog = ({
  isOpen,
  onClose,
  onFilter,
  currentFilter,
  currentDesarrolloId,
}: FilterDialogProps) => {
  const [estadoFilter, setEstadoFilter] = useState(currentFilter);
  const [desarrolloFilter, setDesarrolloFilter] = useState(currentDesarrolloId || '');
  const { desarrollos, isLoading } = useDesarrollos();

  // Actualizar estados cuando los props cambien
  useEffect(() => {
    setEstadoFilter(currentFilter);
    setDesarrolloFilter(currentDesarrolloId || '');
  }, [currentFilter, currentDesarrolloId, isOpen]);

  const handleSubmit = () => {
    onFilter(estadoFilter, desarrolloFilter || undefined);
  };

  const handleResetFilters = () => {
    setEstadoFilter('todas');
    setDesarrolloFilter('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Filtrar Ventas</DialogTitle>
        <DialogDescription>
          Selecciona los criterios para filtrar las ventas.
        </DialogDescription>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="estado">Estado de la venta</Label>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las ventas</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desarrollo">Desarrollo</Label>
            <Select value={desarrolloFilter} onValueChange={setDesarrolloFilter}>
              <SelectTrigger id="desarrollo" disabled={isLoading}>
                <SelectValue placeholder="Todos los desarrollos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los desarrollos</SelectItem>
                {desarrollos.map(desarrollo => (
                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                    {desarrollo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex space-x-2 justify-between">
          <Button variant="ghost" onClick={handleResetFilters} type="button">
            Resetear filtros
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Aplicar filtros
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
