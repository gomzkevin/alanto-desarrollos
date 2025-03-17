
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

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

  // Detectar tipo de interés actual al cargar
  useEffect(() => {
    if (value) {
      if (value.startsWith('desarrollo:')) {
        setActiveTab('desarrollos');
      } else if (value.startsWith('prototipo:')) {
        setActiveTab('prototipos');
        // Extraer el ID del prototipo
        const prototipoId = value.split(':')[1];
        // Buscar el prototipo para obtener su desarrollo_id
        const prototipo = prototipos.find(p => p.id === prototipoId);
        if (prototipo) {
          setSelectedDesarrolloId(prototipo.desarrollo_id);
        }
      }
    }
  }, [value, prototipos]);

  // Filtrar desarrollos basados en el término de búsqueda
  const filteredDesarrollos = desarrollos.filter(desarrollo =>
    desarrollo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar prototipos basados en el término de búsqueda
  const filteredPrototipos = prototipos.filter(prototipo =>
    prototipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener el nombre del desarrollo o prototipo seleccionado
  const getSelectedName = () => {
    if (!value) return 'Seleccionar interés...';
    
    if (value.startsWith('desarrollo:')) {
      const desarrolloId = value.split(':')[1];
      const desarrollo = desarrollos.find(d => d.id === desarrolloId);
      return desarrollo ? `${desarrollo.nombre} (Desarrollo)` : 'Seleccionar desarrollo...';
    } else if (value.startsWith('prototipo:')) {
      const prototipoId = value.split(':')[1];
      const prototipo = prototipos.find(p => p.id === prototipoId);
      return prototipo ? `${prototipo.nombre} (Prototipo)` : 'Seleccionar prototipo...';
    }
    
    return 'Seleccionar interés...';
  };

  // Manejar cambio de desarrollo seleccionado
  const handleDesarrolloChange = (desarrolloId: string) => {
    onChange(`desarrollo:${desarrolloId}`);
    setIsOpen(false);
  };

  // Manejar cambio de desarrollo para filtrar prototipos
  const handleDesarrolloFilterChange = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
  };

  // Manejar cambio de prototipo seleccionado
  const handlePrototipoChange = (prototipoId: string) => {
    onChange(`prototipo:${prototipoId}`);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <div className="relative">
        {/* Selector principal que muestra el valor actual */}
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
                <TabsTrigger value="prototipos" className="text-sm">Prototipos</TabsTrigger>
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
                      className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
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
                <div className="mb-3">
                  <div className="px-2 py-2 font-medium text-sm text-gray-700">Filtrar por desarrollo:</div>
                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                    {desarrollos.map((desarrollo) => (
                      <div
                        key={desarrollo.id}
                        className={`px-3 py-1.5 rounded text-sm cursor-pointer ${
                          selectedDesarrolloId === desarrollo.id 
                            ? 'bg-indigo-100 text-indigo-700 font-medium' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleDesarrolloFilterChange(desarrollo.id)}
                      >
                        {desarrollo.nombre}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="max-h-[200px] overflow-y-auto mt-4">
                  <div className="px-2 mb-2 font-medium text-sm text-gray-700">
                    {selectedDesarrolloId 
                      ? `Prototipos en ${desarrollos.find(d => d.id === selectedDesarrolloId)?.nombre || ''}:` 
                      : 'Selecciona un desarrollo para ver sus prototipos'}
                  </div>
                  {prototiposLoading ? (
                    <div className="px-2 py-2 text-center text-gray-500 text-sm">
                      Cargando prototipos...
                    </div>
                  ) : selectedDesarrolloId ? (
                    filteredPrototipos.length > 0 ? (
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
                    )
                  ) : (
                    <div className="px-2 py-4 text-center text-gray-500 text-sm">
                      Selecciona un desarrollo para ver sus prototipos
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestSelector;
