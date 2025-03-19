import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
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
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('');
  const [selectedPrototipoId, setSelectedPrototipoId] = useState<string>('');
  const [interestType, setInterestType] = useState<'desarrollo' | 'prototipo'>(
    value?.startsWith('desarrollo:') ? 'desarrollo' : 'prototipo'
  );
  
  const { desarrollos } = useDesarrollos();
  const { prototipos } = usePrototipos();
  
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
      setSelectedDesarrolloId('');
      setSelectedPrototipoId('');
    }
  }, [value, prototipos]);

  const handleDesarrolloSelect = (desarrolloId: string) => {
    setSelectedDesarrolloId(desarrolloId);
    setSelectedPrototipoId('');
    if (selectedPrototipoId) {
      setInterestType('prototipo');
    } else {
      setInterestType('desarrollo');
      onChange(`desarrollo:${desarrolloId}`);
    }
  };

  const handlePrototipoSelect = (prototipoId: string) => {
    setSelectedPrototipoId(prototipoId);
    setInterestType('prototipo');
    onChange(`prototipo:${prototipoId}`);
  };

  const handleInterestTypeChange = (newType: 'desarrollo' | 'prototipo') => {
    setInterestType(newType);
    if (newType === 'desarrollo' && selectedDesarrolloId) {
      onChange(`desarrollo:${selectedDesarrolloId}`);
    } else if (newType === 'prototipo' && selectedPrototipoId) {
      onChange(`prototipo:${selectedPrototipoId}`);
    } else {
      onChange('');
    }
  };

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
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      
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
