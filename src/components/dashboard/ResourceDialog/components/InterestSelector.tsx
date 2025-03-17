
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { cn } from '@/lib/utils';

interface InterestSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const InterestSelector: React.FC<InterestSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('desarrollos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(null);
  
  const { desarrollos, isLoading: desarrollosLoading } = useDesarrollos();
  const { prototipos, isLoading: prototiposLoading } = usePrototipos({ 
    desarrolloId: selectedDesarrolloId 
  });

  // Detect current interest type on load
  useEffect(() => {
    if (value) {
      if (value.startsWith('desarrollo:')) {
        setActiveTab('desarrollos');
        const desarrolloId = value.split(':')[1];
        setSelectedDesarrolloId(desarrolloId);
      } else if (value.startsWith('prototipo:')) {
        setActiveTab('prototipos');
        // Extract prototipo ID
        const prototipoId = value.split(':')[1];
        // Find the prototipo to get its desarrollo_id
        const prototipo = prototipos.find(p => p.id === prototipoId);
        if (prototipo) {
          setSelectedDesarrolloId(prototipo.desarrollo_id);
        }
      }
    }
  }, [value, prototipos]);

  // Filter desarrollos based on search term
  const filteredDesarrollos = desarrollos.filter(desarrollo =>
    desarrollo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter prototipos based on search term and selected desarrollo
  const filteredPrototipos = prototipos.filter(prototipo =>
    prototipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the name of the selected desarrollo or prototipo
  const getSelectedName = () => {
    if (!value) return 'Seleccionar interés...';
    
    if (value.startsWith('desarrollo:')) {
      const desarrolloId = value.split(':')[1];
      const desarrollo = desarrollos.find(d => d.id === desarrolloId);
      return desarrollo ? `${desarrollo.nombre} (Desarrollo)` : 'Seleccionar desarrollo...';
    } else if (value.startsWith('prototipo:')) {
      const prototipoId = value.split(':')[1];
      const prototipo = prototipos.find(p => p.id === prototipoId);
      const desarrollo = prototipo && desarrollos.find(d => d.id === prototipo.desarrollo_id);
      return prototipo 
        ? `${prototipo.nombre} en ${desarrollo?.nombre || ''} (Prototipo)` 
        : 'Seleccionar prototipo...';
    }
    
    return 'Seleccionar interés...';
  };

  // Handle desarrollo selection
  const handleDesarrolloChange = (desarrolloId: string) => {
    onChange(`desarrollo:${desarrolloId}`);
    setSelectedDesarrolloId(desarrolloId);
    
    // If only one tab is showing, close the dropdown
    if (activeTab === 'desarrollos') {
      setIsOpen(false);
    } else {
      // If we're in the prototipos tab, switch to it
      setActiveTab('prototipos');
    }
  };

  // Handle prototipo selection
  const handlePrototipoChange = (prototipoId: string) => {
    onChange(`prototipo:${prototipoId}`);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.interest-selector-dropdown')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get the selected desarrollo name
  const getSelectedDesarrolloName = () => {
    if (!selectedDesarrolloId) return '';
    const desarrollo = desarrollos.find(d => d.id === selectedDesarrolloId);
    return desarrollo ? desarrollo.nombre : '';
  };

  return (
    <div className={className}>
      <div className="relative interest-selector-dropdown">
        {/* Main selector showing current value */}
        <div 
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{getSelectedName()}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        {/* Dropdown content */}
        {isOpen && (
          <div className="absolute z-50 top-full mt-1 w-full max-h-[350px] overflow-y-auto rounded-md border bg-white shadow-lg">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sticky top-0 bg-white z-10">
                <TabsTrigger value="desarrollos" className="text-sm">Desarrollos</TabsTrigger>
                <TabsTrigger value="prototipos" className={cn(
                  "text-sm",
                  !selectedDesarrolloId && "opacity-50 cursor-not-allowed"
                )}>
                  Prototipos
                </TabsTrigger>
              </TabsList>
              
              <div className="relative mx-3 mb-3 sticky top-12 bg-white z-10 pb-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder={`Buscar ${activeTab === 'desarrollos' ? 'desarrollos' : 'prototipos'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <TabsContent value="desarrollos" className="mt-0 max-h-[200px] px-3 pb-2">
                {desarrollosLoading ? (
                  <div className="px-2 py-4 text-center text-gray-500 text-sm">
                    Cargando desarrollos...
                  </div>
                ) : filteredDesarrollos.length > 0 ? (
                  filteredDesarrollos.map((desarrollo) => (
                    <div
                      key={desarrollo.id}
                      className={cn(
                        "flex items-center px-3 py-2 cursor-pointer rounded-md",
                        selectedDesarrolloId === desarrollo.id 
                          ? "bg-indigo-100 text-indigo-700" 
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => handleDesarrolloChange(desarrollo.id)}
                    >
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-sm text-indigo-700">{desarrollo.nombre.charAt(0)}</span>
                      </div>
                      <span className="text-sm">{desarrollo.nombre}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-4 text-center text-gray-500 text-sm">
                    No se encontraron desarrollos
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="prototipos" className="mt-0 px-3 pb-2">
                {!selectedDesarrolloId ? (
                  <div className="px-3 py-4 text-center text-gray-500 text-sm">
                    Selecciona un desarrollo primero para ver sus prototipos
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 font-medium text-sm mb-3 bg-indigo-50 rounded-md text-indigo-700">
                      Prototipos en {getSelectedDesarrolloName()}
                    </div>
                    
                    {prototiposLoading ? (
                      <div className="px-2 py-4 text-center text-gray-500 text-sm">
                        Cargando prototipos...
                      </div>
                    ) : filteredPrototipos.length > 0 ? (
                      filteredPrototipos.map((prototipo) => (
                        <div
                          key={prototipo.id}
                          className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
                          onClick={() => handlePrototipoChange(prototipo.id)}
                        >
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-2">
                            <span className="text-sm text-teal-700">{prototipo.nombre.charAt(0)}</span>
                          </div>
                          <span className="text-sm">{prototipo.nombre}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-center text-gray-500 text-sm">
                        No se encontraron prototipos para este desarrollo
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestSelector;
