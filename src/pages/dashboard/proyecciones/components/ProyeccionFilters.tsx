
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesarrollos, usePrototipos } from '@/hooks';
import { useEffect } from 'react';

export interface ProyeccionFiltersProps {
  initialConfig: any;
  onChange: (newConfig: any) => void;
}

export const ProyeccionFilters = ({
  initialConfig,
  onChange
}: ProyeccionFiltersProps) => {
  const selectedDesarrolloId = initialConfig?.desarrolloId || 'global';
  const selectedPrototipoId = initialConfig?.prototipoId || 'global';
  
  const { desarrollos = [], isLoading: desarrollosLoading } = useDesarrollos();
  const { prototipos = [], isLoading: prototiposLoading } = usePrototipos({ 
    desarrolloId: selectedDesarrolloId !== 'global' ? selectedDesarrolloId : null
  });

  // Handle desarrollo change
  const handleDesarrolloChange = (value: string) => {
    onChange({
      ...initialConfig,
      desarrolloId: value,
      prototipoId: 'global' // Reset prototipo when desarrollo changes
    });
  };
  
  // Handle prototipo change
  const handlePrototipoChange = (value: string) => {
    onChange({
      ...initialConfig,
      prototipoId: value
    });
  };

  // Reset prototipo selection when desarrollo changes
  useEffect(() => {
    // Only reset if a prototipo is selected and it's not global
    if (selectedPrototipoId !== 'global' && selectedDesarrolloId !== 'global') {
      // Check if the selected prototipo exists in the current desarrollo
      const prototipoExists = prototipos.some(p => p.id === selectedPrototipoId);
      
      if (!prototipoExists) {
        // Reset to global if the prototipo doesn't exist in the current desarrollo
        handlePrototipoChange('global');
      }
    }
  }, [selectedDesarrolloId, prototipos, selectedPrototipoId]);

  return (
    <div className="space-y-2 flex flex-col sm:items-end">
      <div className="w-full sm:w-72">
        <Select
          value={selectedDesarrolloId}
          onValueChange={handleDesarrolloChange}
        >
          <SelectTrigger className="bg-white border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium text-indigo-700 shadow-sm">
            <SelectValue placeholder="Seleccionar desarrollo" />
          </SelectTrigger>
          <SelectContent className="bg-white border-indigo-100 shadow-md">
            <SelectItem value="global" className="font-medium text-indigo-700">Todos los desarrollos</SelectItem>
            {desarrollos.map((desarrollo) => (
              <SelectItem key={desarrollo.id} value={desarrollo.id} className="text-slate-700 hover:text-indigo-600">
                {desarrollo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="w-full sm:w-72">
        <Select
          value={selectedPrototipoId}
          onValueChange={handlePrototipoChange}
          disabled={selectedDesarrolloId === 'global'}
        >
          <SelectTrigger className="bg-white border-teal-200 hover:border-teal-300 hover:bg-teal-50 transition-all font-medium text-teal-700 shadow-sm">
            <SelectValue placeholder="Seleccionar prototipo" />
          </SelectTrigger>
          <SelectContent className="bg-white border-teal-100 shadow-md">
            <SelectItem value="global" className="font-medium text-teal-700">Todos los prototipos</SelectItem>
            {prototipos.map((prototipo) => (
              <SelectItem key={prototipo.id} value={prototipo.id} className="text-slate-700 hover:text-teal-600">
                {prototipo.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500 mt-1">
          {selectedDesarrolloId === 'global' 
            ? "Selecciona un desarrollo primero" 
            : selectedPrototipoId !== 'global'
              ? "Usando configuración específica de prototipo"
              : "Usando configuración de desarrollo"}
        </p>
      </div>
    </div>
  );
};
