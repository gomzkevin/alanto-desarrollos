
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDesarrollos } from '@/hooks/useDesarrollos';
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
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('');
  const [selectedPrototipoId, setSelectedPrototipoId] = useState<string>('');
  const [interestType, setInterestType] = useState<'desarrollo' | 'prototipo'>(
    value?.startsWith('desarrollo:') ? 'desarrollo' : 'prototipo'
  );
  
  // Fetch data
  const { desarrollos } = useDesarrollos({
    onSuccess: () => {},
    onError: (error) => console.error("Error fetching desarrollos:", error)
  });
  const { prototipos } = usePrototipos({
    desarrolloId: selectedDesarrolloId || undefined
  });
  
  // Parse the initial value and set the correct state
  useEffect(() => {
    if (value) {
      if (value.startsWith('desarrollo:')) {
        const desarrolloId = value.split(':')[1];
        setSelectedDesarrolloId(desarrolloId);
        setInterestType('desarrollo');
        setSelectedPrototipoId('');
      } else if (value.startsWith('prototipo:')) {
        const prototipoId = value.split(':')[1];
        const prototipo = prototipos.find(p => p.id === prototipoId);
        if (prototipo) {
          setSelectedDesarrolloId(prototipo.desarrollo_id);
          setSelectedPrototipoId(prototipoId);
          setInterestType('prototipo');
        }
      }
    } else {
      // Reset if value is empty
      setSelectedDesarrolloId('');
      setSelectedPrototipoId('');
    }
  }, [value, prototipos]);

  // Handle desarrollo selection
  const handleDesarrolloSelect = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
    setSelectedPrototipoId(''); // Reset prototipo selection when desarrollo changes
    
    // Update interest type based on whether a prototipo is selected
    if (selectedPrototipoId) {
      setInterestType('prototipo');
    } else {
      setInterestType('desarrollo');
      onChange(`desarrollo:${desarrolloId}`);
    }
  };

  // Handle prototipo selection
  const handlePrototipoSelect = (prototipoId: string) => {
    setSelectedPrototipoId(prototipoId);
    setInterestType('prototipo');
    onChange(`prototipo:${prototipoId}`);
  };

  // Handle interest type change
  const handleInterestTypeChange = (newType: 'desarrollo' | 'prototipo') => {
    setInterestType(newType);
    
    // Update the value based on the new type and current selections
    if (newType === 'desarrollo' && selectedDesarrolloId) {
      onChange(`desarrollo:${selectedDesarrolloId}`);
    } else if (newType === 'prototipo' && selectedPrototipoId) {
      onChange(`prototipo:${selectedPrototipoId}`);
    } else {
      onChange(''); // Reset if there's no valid selection
    }
  };

  // When a prototipo is selected, automatically set the interest type to prototipo
  useEffect(() => {
    if (selectedPrototipoId) {
      setInterestType('prototipo');
      onChange(`prototipo:${selectedPrototipoId}`);
    } else if (selectedDesarrolloId) {
      setInterestType('desarrollo');
      onChange(`desarrollo:${selectedDesarrolloId}`);
    }
  }, [selectedPrototipoId, selectedDesarrolloId, onChange]);

  return (
    <div className="space-y-4">
      {label && <Label>{label}</Label>}
      
      <div className="space-y-4">
        <Select
          value={selectedDesarrolloId}
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
        
        {selectedDesarrolloId && (
          <Select
            value={selectedPrototipoId}
            onValueChange={handlePrototipoSelect}
            disabled={!selectedDesarrolloId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prototipo (opcional)..." />
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
    </div>
  );
};

export default InterestSelector;
