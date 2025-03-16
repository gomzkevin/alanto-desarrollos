
import { useState, useEffect, useRef } from 'react';
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
  preserveSelectionKey?: string; // Add a key to help identify when to preserve selection
}

export function ClientSearch({ 
  value, 
  onSelect, 
  placeholder = "Buscar cliente...",
  isExistingClient,
  onExistingClientChange,
  onNewClientDataChange,
  newClientData,
  preserveSelectionKey
}: ClientSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const { leads, isLoading } = useLeads({});
  const inputRef = useRef<HTMLInputElement>(null);
  const prevPreserveKeyRef = useRef<string | undefined>(preserveSelectionKey);

  // Actualizar el nombre mostrado cuando cambia el valor o se cargan los leads
  useEffect(() => {
    if (value && leads.length > 0 && isExistingClient) {
      const lead = leads.find(lead => lead.id === value);
      if (lead) {
        setSelectedLead(lead);
        setDisplayName(lead.nombre || '');
      }
    } else if (!value) {
      setSelectedLead(null);
      setDisplayName('');
    }
  }, [value, leads, isExistingClient]);

  // Track preserveSelectionKey changes to prevent clearing selection
  useEffect(() => {
    // Only update the previous key after component re-render
    prevPreserveKeyRef.current = preserveSelectionKey;
  }, [preserveSelectionKey]);

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
    setSelectedLead(lead);
    onSelect(lead.id, lead.nombre || '');
    setSearch('');
    setOpen(false);
  };

  // Limpiar la selección
  const handleClear = () => {
    setSelectedLead(null);
    onSelect('', '');
    setSearch('');
    setDisplayName('');
    // Reabrir el popover después de limpiar
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const renderExistingClientSearch = () => (
    <div className="relative w-full">
      <div className="flex w-full relative rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring">
        <div className="flex-1 relative">
          {selectedLead ? (
            <Button 
              variant="ghost" 
              className="w-full justify-start h-10 px-3 text-left font-normal"
              onClick={() => setOpen(true)}
              type="button"
            >
              <div className="text-left w-full truncate">
                <div className="font-medium">{selectedLead.nombre}</div>
                {selectedLead.email && (
                  <div className="text-xs text-muted-foreground">
                    {selectedLead.email}
                  </div>
                )}
                {selectedLead.telefono && !selectedLead.email && (
                  <div className="text-xs text-muted-foreground">
                    {selectedLead.telefono}
                  </div>
                )}
              </div>
            </Button>
          ) : (
            <Input
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={() => setOpen(true)}
              ref={inputRef}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          )}
        </div>
        
        <div className="flex items-center pr-2">
          {selectedLead ? (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setOpen(true);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              className="h-8 w-8"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Utilizamos un dropdown simple en lugar de Popover para mejor control */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="p-3 border-b">
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          
          <ScrollArea className="max-h-60">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : filteredLeads.length > 0 ? (
              <div className="py-1">
                {filteredLeads.map((lead) => (
                  <Button
                    key={lead.id}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-left h-auto"
                    onClick={() => handleSelectLead(lead)}
                  >
                    <div className="truncate flex flex-col items-start w-full">
                      <span className="font-medium">{lead.nombre}</span>
                      {lead.email && (
                        <span className="text-xs text-muted-foreground">{lead.email}</span>
                      )}
                      {lead.telefono && (
                        <span className="text-xs text-muted-foreground">Teléfono: {lead.telefono}</span>
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
        </div>
      )}
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

  // Manejar clics fuera para cerrar el dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (open && !event.defaultPrevented && inputRef.current && !inputRef.current.contains(target)) {
        // Solo cerrar si el clic no fue en un botón dentro del dropdown
        // Fix: Use Element type assertion to access closest method
        const targetElement = event.target as Element;
        if (!targetElement.closest('button')) {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

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

