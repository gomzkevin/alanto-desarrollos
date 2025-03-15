
import { useState, useEffect } from 'react';
import { CommandInput, CommandItem, CommandList, CommandEmpty, Command } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import useLeads from '@/hooks/useLeads';

interface LeadComboboxProps {
  value: string;
  onChange: (value: string, displayName: string) => void;
}

export function LeadCombobox({ value, onChange }: LeadComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { leads = [] } = useLeads({});
  const [selectedLeadName, setSelectedLeadName] = useState('');

  // Actualizar el nombre del lead seleccionado cuando cambia el valor o se cargan los leads
  useEffect(() => {
    if (value && leads.length > 0) {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setSelectedLeadName(selectedLead.nombre);
      }
    }
  }, [value, leads]);

  // Filtrar leads basados en el término de búsqueda
  const filteredLeads = leads.filter(lead => {
    const searchLower = searchQuery.toLowerCase();
    const nombreMatches = lead.nombre?.toLowerCase().includes(searchLower);
    const emailMatches = lead.email?.toLowerCase().includes(searchLower);
    const telefonoMatches = lead.telefono?.toLowerCase().includes(searchLower);
    
    return nombreMatches || emailMatches || telefonoMatches;
  });

  const handleSelect = (currentValue: string) => {
    // Encontrar el lead seleccionado
    const selectedLead = leads.find(lead => lead.id === currentValue);
    if (selectedLead) {
      // Llamar al callback con el ID y nombre del lead
      onChange(currentValue, selectedLead.nombre);
      setSelectedLeadName(selectedLead.nombre);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          onClick={() => setOpen(!open)}
        >
          {selectedLeadName || "Seleccionar comprador..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar por nombre, email o teléfono..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No se encontraron compradores.</CommandEmpty>
            {filteredLeads.map((lead) => (
              <CommandItem
                key={lead.id}
                value={lead.id}
                onSelect={() => handleSelect(lead.id)}
                className="cursor-pointer flex flex-col items-start"
              >
                <div className="flex items-center w-full">
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === lead.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{lead.nombre}</span>
                    {lead.email && (
                      <span className="text-xs text-muted-foreground">{lead.email}</span>
                    )}
                    {lead.telefono && !lead.email && (
                      <span className="text-xs text-muted-foreground">{lead.telefono}</span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
