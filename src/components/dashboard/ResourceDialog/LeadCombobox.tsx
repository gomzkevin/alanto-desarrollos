
import { useState, useEffect } from 'react';
import { CommandInput, CommandItem, CommandList, CommandEmpty, Command } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, User } from 'lucide-react';
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

  // Encontrar el nombre del lead seleccionado inicialmente
  useEffect(() => {
    if (value) {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setSelectedLeadName(selectedLead.nombre);
      }
    }
  }, [value, leads]);

  // Filtrar leads basados en el término de búsqueda
  const filteredLeads = leads.filter(lead => 
    lead.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (lead.telefono && lead.telefono.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (leadId: string) => {
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      onChange(leadId, selectedLead.nombre);
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
          />
          <CommandList>
            <CommandEmpty>No se encontraron compradores.</CommandEmpty>
            {filteredLeads.map((lead) => (
              <CommandItem
                key={lead.id}
                value={lead.id}
                onSelect={() => handleSelect(lead.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === lead.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{lead.nombre}</span>
                  {lead.email && (
                    <span className="text-xs text-muted-foreground">{lead.email}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
