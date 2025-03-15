
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from '@/components/Calculator';

interface ProyeccionCalculatorProps {
  desarrolloId?: string;
  prototipoId?: string;
  onDataUpdate: (data: any[]) => void;
  shouldCalculate: boolean;
  onCreateProjection: () => void;
}

export const ProyeccionCalculator = ({
  desarrolloId,
  prototipoId,
  onDataUpdate,
  shouldCalculate,
  onCreateProjection
}: ProyeccionCalculatorProps) => {
  return (
    <Card className="xl:col-span-3 xl:max-w-md">
      <CardHeader>
        <CardTitle>Parámetros de proyección</CardTitle>
        <CardDescription>
          Ajusta los valores para personalizar el análisis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Calculator 
          desarrolloId={desarrolloId}
          prototipoId={prototipoId}
          onDataUpdate={onDataUpdate}
          shouldCalculate={shouldCalculate}
        />
        
        <Button 
          onClick={onCreateProjection} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6"
        >
          Crear Proyección
        </Button>
      </CardContent>
    </Card>
  );
};
