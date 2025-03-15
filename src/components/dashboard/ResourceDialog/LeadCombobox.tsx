
import { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
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
  const { leads, isLoading } = useLeads({});
  const [displayName, setDisplayName] = useState('');

  // Update displayName when value changes or leads load
  useEffect(() => {
    if (value && leads.length > 0) {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setDisplayName(selectedLead.nombre || '');
      }
    } else if (!value) {
      setDisplayName('');
    }
  }, [value, leads]);

  // Simple string normalization for searching - remove accents, lowercase
  const normalizeText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter(lead => {
    if (!searchQuery.trim()) return true;
    
    const query = normalizeText(searchQuery);
    
    const nameMatch = normalizeText(lead.nombre).includes(query);
    const emailMatch = normalizeText(lead.email).includes(query);
    const phoneMatch = normalizeText(lead.telefono).includes(query);
    
    return nameMatch || emailMatch || phoneMatch;
  });

  // Handle selection of a lead
  const handleSelectLead = (leadId: string) => {
    const selectedLead = leads.find(lead => lead.id === leadId);
    if (selectedLead) {
      onChange(leadId, selectedLead.nombre || '');
      setDisplayName(selectedLead.nombre || '');
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
          {displayName || "Seleccionar comprador..."}
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
            <CommandGroup>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                filteredLeads.map((lead) => (
                  <CommandItem
                    key={lead.id}
                    value={lead.id}
                    onSelect={() => handleSelectLead(lead.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{lead.nombre || 'Sin nombre'}</span>
                        <span className="text-xs text-muted-foreground">
                          {lead.email || lead.telefono || 'Sin contacto'}
                        </span>
                      </div>
                      <Check 
                        className={cn(
                          "ml-2 h-4 w-4",
                          value === lead.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
