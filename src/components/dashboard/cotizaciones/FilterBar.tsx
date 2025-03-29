
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Desarrollo } from '@/hooks/desarrollos/types';
import { Prototipo } from '@/hooks/usePrototipos';

interface FilterBarProps {
  desarrollos: Desarrollo[];
  prototipos: Prototipo[];
  selectedDesarrollo?: string;
  selectedPrototipo?: string;
  onDesarrolloChange: (desarrolloId?: string) => void;
  onPrototipoChange: (prototipoId?: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  desarrollos,
  prototipos,
  selectedDesarrollo,
  selectedPrototipo,
  onDesarrolloChange,
  onPrototipoChange
}) => {
  return (
    <div className="bg-white p-4 border-b flex flex-col sm:flex-row gap-4 items-end">
      <div className="space-y-2 w-full sm:w-64">
        <Label htmlFor="desarrollo-filter">Desarrollo</Label>
        <Select 
          value={selectedDesarrollo || ""} 
          onValueChange={(value) => onDesarrolloChange(value === "all" ? undefined : value)}
        >
          <SelectTrigger id="desarrollo-filter">
            <SelectValue placeholder="Todos los desarrollos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los desarrollos</SelectItem>
            {desarrollos.map((desarrollo) => (
              <SelectItem key={desarrollo.id} value={desarrollo.id}>
                {desarrollo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2 w-full sm:w-64">
        <Label htmlFor="prototipo-filter">Prototipo</Label>
        <Select 
          value={selectedPrototipo || ""}
          onValueChange={(value) => onPrototipoChange(value === "all" ? undefined : value)}
          disabled={!selectedDesarrollo}
        >
          <SelectTrigger id="prototipo-filter">
            <SelectValue placeholder="Todos los prototipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los prototipos</SelectItem>
            {prototipos.map((prototipo) => (
              <SelectItem key={prototipo.id} value={prototipo.id}>
                {prototipo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterBar;
