
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export interface ProyeccionFiltersProps {
  initialConfig: any;
  onChange: (newConfig: any) => void;
}

export const ProyeccionFilters: React.FC<ProyeccionFiltersProps> = ({ 
  initialConfig, 
  onChange 
}) => {
  const [config, setConfig] = React.useState(initialConfig);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const handleApplyFilters = () => {
    onChange(config);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Configuración de Proyección</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Inversión Inicial</Label>
            <Input 
              type="number"
              value={config.initialInvestment || 0}
              onChange={(e) => handleConfigChange('initialInvestment', Number(e.target.value))}
              placeholder="Inversión inicial"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Tasa de Interés Anual (%)</Label>
            <Input 
              type="number"
              value={config.interestRate || 0}
              onChange={(e) => handleConfigChange('interestRate', Number(e.target.value))}
              placeholder="Tasa de interés"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Plazo (meses)</Label>
            <Input 
              type="number"
              value={config.term || 12}
              onChange={(e) => handleConfigChange('term', Number(e.target.value))}
              placeholder="Plazo en meses"
            />
          </div>
          
          <div className="space-y-3">
            <Label>Tipo de Proyección</Label>
            <Select 
              value={config.type || 'desarrollo'}
              onValueChange={(value) => handleConfigChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desarrollo">Desarrollo</SelectItem>
                <SelectItem value="unidad">Unidad</SelectItem>
                <SelectItem value="rentabilidad">Rentabilidad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Retorno Esperado (%): {config.expectedReturn || 10}%</Label>
          <Slider 
            value={[config.expectedReturn || 10]}
            min={1}
            max={30}
            step={1}
            onValueChange={(values) => handleConfigChange('expectedReturn', values[0])}
          />
        </div>
        
        <Button onClick={handleApplyFilters} className="w-full">
          Calcular Proyección
        </Button>
      </CardContent>
    </Card>
  );
};
