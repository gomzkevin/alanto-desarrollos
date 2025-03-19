
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, UserRound } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { cn } from '@/lib/utils';

export interface ClientSearchProps {
  value: string;
  onClientSelect: (leadId: string, leadName: string) => void;
  isExistingClient?: boolean;
  onExistingClientChange?: (isExisting: boolean) => void;
  newClientData?: { nombre: string; email: string; telefono: string };
  onNewClientDataChange?: (field: string, value: string) => void;
  disabled?: boolean;
}

export const ClientSearch = ({
  value,
  onClientSelect,
  isExistingClient = true,
  onExistingClientChange = () => {},
  newClientData = { nombre: '', email: '', telefono: '' },
  onNewClientDataChange = () => {},
  disabled = false
}: ClientSearchProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const { leads, isLoading } = useLeads();

  useEffect(() => {
    if (value) {
      const lead = leads.find(lead => lead.id === value);
      if (lead) {
        setSelectedClient(lead.nombre);
      }
    } else {
      setSelectedClient(null);
    }
  }, [value, leads]);

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedClient ? (
            <div className="flex items-center">
              <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{selectedClient}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Seleccionar cliente</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar cliente..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No se encontraron clientes.</CommandEmpty>
            <CommandGroup heading="Clientes">
              {leads
                .filter(lead => 
                  lead.nombre.toLowerCase().includes(search.toLowerCase()) ||
                  (lead.email && lead.email.toLowerCase().includes(search.toLowerCase())) ||
                  (lead.telefono && lead.telefono.includes(search))
                )
                .slice(0, 10)
                .map(lead => (
                  <CommandItem
                    key={lead.id}
                    value={lead.id}
                    onSelect={() => {
                      onClientSelect(lead.id, lead.nombre);
                      setSelectedClient(lead.nombre);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center">
                      <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{lead.nombre}</p>
                        {lead.email && (
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        )}
                      </div>
                    </div>
                    {value === lead.id && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                ))
              }
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
