
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [activeTab, setActiveTab] = useState<string>('desarrollos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string | null>(null);
  
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({ 
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
  };

  // Manejar cambio de desarrollo para filtrar prototipos
  const handleDesarrolloFilterChange = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
  };

  // Manejar cambio de prototipo seleccionado
  const handlePrototipoChange = (prototipoId: string) => {
    onChange(`prototipo:${prototipoId}`);
  };

  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={getSelectedName()} />
        </SelectTrigger>
        <SelectContent className="w-[450px] max-h-[350px]">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="desarrollos" className="text-sm">Desarrollos</TabsTrigger>
              <TabsTrigger value="prototipos" className="text-sm">Prototipos</TabsTrigger>
            </TabsList>
            
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder={`Buscar ${activeTab === 'desarrollos' ? 'desarrollos' : 'prototipos'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <TabsContent value="desarrollos" className="mt-0 max-h-[200px] overflow-y-auto">
              {filteredDesarrollos.length > 0 ? (
                filteredDesarrollos.map((desarrollo) => (
                  <div
                    key={desarrollo.id}
                    className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-md"
                    onClick={() => handleDesarrolloChange(desarrollo.id)}
                  >
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs text-indigo-700">{desarrollo.nombre.charAt(0)}</span>
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
            
            <TabsContent value="prototipos" className="mt-0 space-y-3">
              <Select 
                value={selectedDesarrolloId || ''} 
                onValueChange={handleDesarrolloFilterChange}
              >
                <SelectTrigger className="w-full bg-gray-50">
                  <SelectValue placeholder="Filtrar por desarrollo..." />
                </SelectTrigger>
                <SelectContent>
                  {desarrollos.map((desarrollo) => (
                    <SelectItem key={desarrollo.id} value={desarrollo.id}>
                      {desarrollo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="max-h-[150px] overflow-y-auto">
                {selectedDesarrolloId ? (
                  filteredPrototipos.length > 0 ? (
                    filteredPrototipos.map((prototipo) => (
                      <div
                        key={prototipo.id}
                        className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded-md"
                        onClick={() => handlePrototipoChange(prototipo.id)}
                      >
                        <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs text-teal-700">{prototipo.nombre.charAt(0)}</span>
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
        </SelectContent>
      </Select>
    </div>
  );
};

export default InterestSelector;
