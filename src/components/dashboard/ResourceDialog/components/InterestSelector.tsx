
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Building, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

interface InterestSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function InterestSelector({ value, onChange, className }: InterestSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(null);
  const { desarrollos, isLoading: isLoadingDesarrollos } = useDesarrollos();
  const { prototipos, isLoading: isLoadingPrototipos } = usePrototipos({
    desarrolloId: selectedDesarrolloId,
  });

  // Extraer el ID del desarrollo si el valor tiene el formato "desarrollo:ID"
  useEffect(() => {
    if (value && value.startsWith('desarrollo:')) {
      const desarrolloId = value.split(':')[1];
      setSelectedDesarrolloId(desarrolloId);
    } else if (value && value.startsWith('prototipo:')) {
      // Encontrar el desarrollo correspondiente al prototipo
      const prototipoId = value.split(':')[1];
      const prototipo = prototipos.find(p => p.id === prototipoId);
      if (prototipo) {
        setSelectedDesarrolloId(prototipo.desarrollo_id);
      }
    } else {
      setSelectedDesarrolloId(null);
    }
  }, [value, prototipos]);

  // Obtener el texto a mostrar en el botón
  const getDisplayValue = () => {
    if (value.startsWith('desarrollo:')) {
      const desarrolloId = value.split(':')[1];
      const desarrollo = desarrollos.find(d => d.id === desarrolloId);
      return desarrollo ? `Desarrollo: ${desarrollo.nombre}` : 'Seleccionar interés';
    } else if (value.startsWith('prototipo:')) {
      const prototipoId = value.split(':')[1];
      const prototipo = prototipos.find(p => p.id === prototipoId);
      return prototipo ? `${prototipo.nombre} (${prototipo.desarrollo?.nombre || 'Sin desarrollo'})` : 'Seleccionar interés';
    }
    return value || 'Seleccionar interés';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          <span className="truncate">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar desarrollo o prototipo..." />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup heading="Desarrollos">
              {isLoadingDesarrollos ? (
                <CommandItem disabled>Cargando desarrollos...</CommandItem>
              ) : desarrollos.length === 0 ? (
                <CommandItem disabled>No hay desarrollos disponibles</CommandItem>
              ) : (
                desarrollos.map(desarrollo => (
                  <CommandItem
                    key={desarrollo.id}
                    value={`desarrollo:${desarrollo.id}`}
                    onSelect={(currentValue) => {
                      const selectedValue = `desarrollo:${desarrollo.id}`;
                      onChange(selectedValue === value ? '' : selectedValue);
                      setSelectedDesarrolloId(desarrollo.id);
                      setOpen(false);
                    }}
                  >
                    <Building className="mr-2 h-4 w-4 text-indigo-600" />
                    <span>{desarrollo.nombre}</span>
                    {value === `desarrollo:${desarrollo.id}` && (
                      <Check className="ml-auto h-4 w-4 text-indigo-600" />
                    )}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Prototipos">
              {selectedDesarrolloId ? (
                isLoadingPrototipos ? (
                  <CommandItem disabled>Cargando prototipos...</CommandItem>
                ) : prototipos.length === 0 ? (
                  <CommandItem disabled>No hay prototipos disponibles</CommandItem>
                ) : (
                  prototipos.map(prototipo => (
                    <CommandItem
                      key={prototipo.id}
                      value={`prototipo:${prototipo.id}`}
                      onSelect={(currentValue) => {
                        const selectedValue = `prototipo:${prototipo.id}`;
                        onChange(selectedValue === value ? '' : selectedValue);
                        setOpen(false);
                      }}
                    >
                      <Home className="mr-2 h-4 w-4 text-sky-500" />
                      <span>{prototipo.nombre}</span>
                      {value === `prototipo:${prototipo.id}` && (
                        <Check className="ml-auto h-4 w-4 text-indigo-600" />
                      )}
                    </CommandItem>
                  ))
                )
              ) : (
                <CommandItem disabled>Seleccione primero un desarrollo</CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
