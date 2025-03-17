
import React, { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { cn } from '@/lib/utils';

interface InterestSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const InterestSelector = ({ value, onChange, className }: InterestSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'desarrollo' | 'prototipo'>('desarrollo');
  const [selectedDesarrollo, setSelectedDesarrollo] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  
  const { desarrollos, isLoading: isLoadingDesarrollos } = useDesarrollos();
  const { prototipos, isLoading: isLoadingPrototipos } = usePrototipos({
    desarrolloId: selectedDesarrollo || undefined,
  });

  // Parse the initial value to set appropriate states
  useEffect(() => {
    if (value) {
      if (value.startsWith('desarrollo:')) {
        const desarrolloId = value.split(':')[1];
        setTab('desarrollo');
        setSelectedDesarrollo(desarrolloId);
        
        const desarrollo = desarrollos.find(d => d.id === desarrolloId);
        if (desarrollo) {
          setDisplayName(`Desarrollo: ${desarrollo.nombre}`);
        }
      } else if (value.startsWith('prototipo:')) {
        const prototipoId = value.split(':')[1];
        setTab('prototipo');
        
        const prototipo = prototipos.find(p => p.id === prototipoId);
        if (prototipo) {
          setSelectedDesarrollo(prototipo.desarrollo_id);
          setDisplayName(`Prototipo: ${prototipo.nombre}`);
        }
      }
    } else {
      setDisplayName('');
    }
  }, [value, desarrollos, prototipos]);

  const handleDesarrolloSelect = (desarrolloId: string) => {
    const newValue = `desarrollo:${desarrolloId}`;
    onChange(newValue);
    setOpen(false);

    // Update display name
    const desarrollo = desarrollos.find(d => d.id === desarrolloId);
    if (desarrollo) {
      setDisplayName(`Desarrollo: ${desarrollo.nombre}`);
    }
  };

  const handlePrototipoSelect = (prototipoId: string) => {
    const newValue = `prototipo:${prototipoId}`;
    onChange(newValue);
    setOpen(false);

    // Update display name
    const prototipo = prototipos.find(p => p.id === prototipoId);
    if (prototipo) {
      setDisplayName(`Prototipo: ${prototipo.nombre}`);
    }
  };

  const handleTabChange = (value: string) => {
    setTab(value as 'desarrollo' | 'prototipo');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className={cn("w-full justify-between", className)}
        >
          {displayName || "Seleccionar interés..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <div className="p-1">
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full border-b pb-2">
            <TabsList className="grid grid-cols-2 w-full bg-gray-100">
              <TabsTrigger 
                value="desarrollo"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
              >
                Desarrollos
              </TabsTrigger>
              <TabsTrigger 
                value="prototipo"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-600"
              >
                Prototipos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Command>
          <CommandInput placeholder={`Buscar ${tab === 'desarrollo' ? 'desarrollos' : 'prototipos'}...`} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            {tab === 'desarrollo' ? (
              <CommandGroup heading="Desarrollos">
                {isLoadingDesarrollos ? (
                  <CommandItem disabled>Cargando desarrollos...</CommandItem>
                ) : desarrollos.length === 0 ? (
                  <CommandItem disabled>No hay desarrollos</CommandItem>
                ) : (
                  desarrollos.map((desarrollo) => (
                    <CommandItem
                      key={desarrollo.id}
                      value={desarrollo.id}
                      onSelect={handleDesarrolloSelect}
                      className="flex items-center justify-between"
                    >
                      <span>{desarrollo.nombre}</span>
                      {value === `desarrollo:${desarrollo.id}` && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            ) : (
              <CommandGroup heading="Prototipos">
                {selectedDesarrollo ? (
                  <>
                    {isLoadingPrototipos ? (
                      <CommandItem disabled>Cargando prototipos...</CommandItem>
                    ) : prototipos.length === 0 ? (
                      <CommandItem disabled>No hay prototipos para este desarrollo</CommandItem>
                    ) : (
                      prototipos.map((prototipo) => (
                        <CommandItem
                          key={prototipo.id}
                          value={prototipo.id}
                          onSelect={handlePrototipoSelect}
                          className="flex items-center justify-between"
                        >
                          <div className="flex flex-col">
                            <span>{prototipo.nombre}</span>
                            <span className="text-xs text-gray-500">
                              {desarrollos.find(d => d.id === prototipo.desarrollo_id)?.nombre}
                            </span>
                          </div>
                          {value === `prototipo:${prototipo.id}` && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </CommandItem>
                      ))
                    )}
                  </>
                ) : (
                  <CommandItem disabled>
                    Seleccione primero un desarrollo
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default InterestSelector;
