
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FilterIcon, X } from "lucide-react";
import { VentasFilters } from "@/hooks/types";

interface VentaFilterBarProps {
  filters: VentasFilters;
  onFilterChange: (filters: Partial<VentasFilters>) => void;
}

export const VentaFilterBar = ({ filters, onFilterChange }: VentaFilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onFilterChange({
      estado: 'todos',
      fechaInicio: undefined,
      fechaFin: undefined,
      unidadId: undefined,
      compradorId: undefined,
      desarrolloId: undefined,
    });
  };

  return (
    <div className="bg-background border rounded-md p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4" />
            <h3 className="text-sm font-medium">Filtros</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={filters.estado || 'todos'}
              onValueChange={(value) => onFilterChange({ estado: value })}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaInicio">Fecha Desde</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.fechaInicio ? (
                    format(new Date(filters.fechaInicio), "PP")
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.fechaInicio ? new Date(filters.fechaInicio) : undefined}
                  onSelect={(date) => onFilterChange({ fechaInicio: date ? date.toISOString() : undefined })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaFin">Fecha Hasta</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.fechaFin ? (
                    format(new Date(filters.fechaFin), "PP")
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.fechaFin ? new Date(filters.fechaFin) : undefined}
                  onSelect={(date) => onFilterChange({ fechaFin: date ? date.toISOString() : undefined })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentaFilterBar;
