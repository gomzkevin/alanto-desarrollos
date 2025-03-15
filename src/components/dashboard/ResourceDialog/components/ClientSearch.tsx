
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, User } from 'lucide-react';
import useLeads from '@/hooks/useLeads';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ClientSearchProps {
  value: string;
  onSelect: (leadId: string, leadName: string) => void;
  placeholder?: string;
  isExistingClient: boolean;
  onExistingClientChange: (isExisting: boolean) => void;
  onNewClientDataChange?: (field: string, value: string) => void;
  newClientData?: {
    nombre: string;
    email: string;
    telefono: string;
  };
}

export function ClientSearch({ 
  value, 
  onSelect, 
  placeholder = "Buscar cliente...",
  isExistingClient,
  onExistingClientChange,
  onNewClientDataChange,
  newClientData
}: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { leads, isLoading } = useLeads({});

  // Actualizar el nombre mostrado cuando cambia el valor o se cargan los leads
  useEffect(() => {
    if (value && leads.length > 0 && isExistingClient) {
      const selectedLead = leads.find(lead => lead.id === value);
      if (selectedLead) {
        setDisplayName(selectedLead.nombre || '');
      }
    } else {
      setDisplayName('');
    }
  }, [value, leads, isExistingClient]);

  // Normalizar texto para búsqueda insensible a acentos
  const normalizeText = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar leads basado en la búsqueda
  const filteredLeads = leads.filter(lead => {
    if (!search) return true;
    
    const searchNormalized = normalizeText(search);
    
    const nameMatch = normalizeText(lead.nombre).includes(searchNormalized);
    const emailMatch = lead.email ? normalizeText(lead.email).includes(searchNormalized) : false;
    const phoneMatch = lead.telefono ? normalizeText(lead.telefono).includes(searchNormalized) : false;
    
    return nameMatch || emailMatch || phoneMatch;
  });

  // Manejar la selección de un lead
  const handleSelectLead = (lead: any) => {
    onSelect(lead.id, lead.nombre || '');
    setSearch('');
    setOpen(false);
  };

  // Limpiar la selección
  const handleClear = () => {
    onSelect('', '');
    setSearch('');
    setDisplayName('');
    setOpen(false);
  };

  const renderExistingClientSearch = () => (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex w-full relative rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring">
            <div className="flex-1 relative">
              {displayName ? (
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-10 px-3 text-left font-normal"
                  onClick={() => setOpen(true)}
                  type="button"
                >
                  {displayName}
                </Button>
              ) : (
                <Input
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setOpen(true)}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              )}
            </div>
            
            <div className="flex items-center pr-2">
              {displayName ? (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClear}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-80">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b">
                <Input
                  placeholder="Buscar cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <ScrollArea className="max-h-60">
                {filteredLeads.length > 0 ? (
                  <div className="py-1">
                    {filteredLeads.map((lead) => (
                      <Button
                        key={lead.id}
                        type="button"
                        variant="ghost"
                        className="w-full justify-start px-3 py-2 text-left h-auto"
                        onClick={() => handleSelectLead(lead)}
                      >
                        <div className="truncate flex flex-col items-start">
                          <span className="font-medium">{lead.nombre}</span>
                          {lead.email && (
                            <span className="text-xs text-muted-foreground">{lead.email}</span>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    No se encontraron clientes
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderNewClientForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del cliente</Label>
        <Input
          id="nombre"
          placeholder="Nombre completo"
          value={newClientData?.nombre || ''}
          onChange={(e) => onNewClientDataChange && onNewClientDataChange('nombre', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="correo@ejemplo.com"
            value={newClientData?.email || ''}
            onChange={(e) => onNewClientDataChange && onNewClientDataChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            placeholder="+52 55 1234 5678"
            value={newClientData?.telefono || ''}
            onChange={(e) => onNewClientDataChange && onNewClientDataChange('telefono', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="existingClient">Cliente existente</Label>
        <Switch
          id="existingClient"
          checked={isExistingClient}
          onCheckedChange={onExistingClientChange}
        />
      </div>
      
      {isExistingClient ? (
        <div>
          <Label>Buscar cliente</Label>
          {renderExistingClientSearch()}
        </div>
      ) : renderNewClientForm()}
    </div>
  );
}
