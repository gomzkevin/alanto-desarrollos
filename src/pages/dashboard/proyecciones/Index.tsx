
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProyeccionView } from './components/ProyeccionView';

export default function ProyeccionesPage() {
  const [initialConfig, setInitialConfig] = useState({
    montoInversion: 5000000,
    plazo: 36,
    tasaInteres: 12,
    tipoProyecto: 'residencial'
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Proyecciones Financieras</CardTitle>
          </CardHeader>
          <CardContent>
            <ProyeccionView initialConfig={initialConfig} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
