
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';

interface InterestSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  value,
  onChange,
  label = 'Interés en',
  description
}) => {
  const [interestType, setInterestType] = useState<'desarrollo' | 'prototipo'>(
    value?.startsWith('desarrollo:') ? 'desarrollo' : 'prototipo'
  );
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('');
  
  // Extract IDs from the value string
  useEffect(() => {
    if (value) {
      if (value.startsWith('desarrollo:')) {
        const desarrolloId = value.split(':')[1];
        setSelectedDesarrolloId(desarrolloId);
        setInterestType('desarrollo');
      } else if (value.startsWith('prototipo:')) {
        const prototipoId = value.split(':')[1];
        const prototipo = prototipos.find(p => p.id === prototipoId);
        if (prototipo) {
          setSelectedDesarrolloId(prototipo.desarrollo_id);
        }
        setInterestType('prototipo');
      }
    }
  }, [value]);

  // Fetch data
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos({
    desarrolloId: selectedDesarrolloId || undefined
  });

  // Handle tab change
  const handleTabChange = (value: string) => {
    setInterestType(value as 'desarrollo' | 'prototipo');
    // Reset the current value when changing tabs
    onChange('');
  };

  // Handle desarrollo selection
  const handleDesarrolloSelect = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
    onChange(`desarrollo:${desarrolloId}`);
  };

  // Handle prototipo selection
  const handlePrototipoSelect = (prototipoId: string) => {
    onChange(`prototipo:${prototipoId}`);
  };

  // Extract current values for display
  const getCurrentDesarrolloId = (): string => {
    if (value?.startsWith('desarrollo:')) {
      return value.split(':')[1];
    } else if (value?.startsWith('prototipo:')) {
      const prototipoId = value.split(':')[1];
      const prototipo = prototipos.find(p => p.id === prototipoId);
      return prototipo?.desarrollo_id || '';
    }
    return '';
  };

  const getCurrentPrototipoId = (): string => {
    if (value?.startsWith('prototipo:')) {
      return value.split(':')[1];
    }
    return '';
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      
      <Tabs value={interestType} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="desarrollo">Desarrollo</TabsTrigger>
          <TabsTrigger value="prototipo">Prototipo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="desarrollo">
          <Select
            value={getCurrentDesarrolloId()}
            onValueChange={handleDesarrolloSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar desarrollo..." />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {desarrollos.length > 0 ? (
                desarrollos.map((desarrollo) => (
                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                    {desarrollo.nombre}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="no-options">No hay desarrollos disponibles</SelectItem>
              )}
            </SelectContent>
          </Select>
        </TabsContent>
        
        <TabsContent value="prototipo">
          <div className="space-y-4">
            <Select
              value={getCurrentDesarrolloId()}
              onValueChange={(id) => {
                setSelectedDesarrolloId(id);
                // Clear prototipo selection when desarrollo changes
                onChange('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Primero selecciona un desarrollo..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {desarrollos.length > 0 ? (
                  desarrollos.map((desarrollo) => (
                    <SelectItem key={desarrollo.id} value={desarrollo.id}>
                      {desarrollo.nombre}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="no-options">No hay desarrollos disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {selectedDesarrolloId && (
              <Select
                value={getCurrentPrototipoId()}
                onValueChange={handlePrototipoSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prototipo..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {prototipos.length > 0 ? (
                    prototipos.map((prototipo) => (
                      <SelectItem key={prototipo.id} value={prototipo.id}>
                        {prototipo.nombre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="no-options">No hay prototipos disponibles para este desarrollo</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterestSelector;
