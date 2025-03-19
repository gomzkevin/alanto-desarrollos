
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { Proyeccion } from '../types';

interface ProyeccionViewProps {
  proyeccionId?: string;
  selectedDesarrolloId?: string;
  selectedPrototipoId?: string;
  onDesarrolloChange?: (value: string) => void;
  onPrototipoChange?: (value: string) => void;
  chartData?: any[]; 
  summaryData?: any;
  onDataUpdate?: (data: any[]) => void;
  shouldCalculate?: boolean;
  onCreateProjection?: () => void;
  fileName?: string;
}

const ProyeccionView: React.FC<ProyeccionViewProps> = ({ 
  proyeccionId,
  selectedDesarrolloId,
  selectedPrototipoId,
  onDesarrolloChange,
  onPrototipoChange,
  chartData,
  summaryData,
  onDataUpdate,
  shouldCalculate,
  onCreateProjection,
  fileName
}) => {
  const [proyeccion, setProyeccion] = useState<Proyeccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDesarrollo, setSelectedDesarrollo] = useState<{id: string, nombre: string} | null>(null);
  const [desarrollos, setDesarrollos] = useState<{id: string, nombre: string}[]>([]);
  const { toast } = useToast();

  // This is a mock implementation since 'proyecciones' table doesn't exist in the Supabase schema
  // We'll simulate this functionality without making actual database calls
  useEffect(() => {
    if (proyeccionId) {
      const fetchProyeccion = async () => {
        setIsLoading(true);
        try {
          // Simulate fetching data
          const mockProyeccion: Proyeccion = {
            id: proyeccionId,
            inversion_inicial: 3500000,
            ingresos_totales: 9500000,
            gastos_totales: 3800000,
            beneficio_neto: 5700000,
            tir: 18.5,
            payback: 3.2,
            desarrollo_id: selectedDesarrolloId,
            desarrollo_nombre: "Desarrollo Simulado"
          };
          
          setProyeccion(mockProyeccion);
          if (mockProyeccion.desarrollo_id) {
            setSelectedDesarrollo({ 
              id: mockProyeccion.desarrollo_id, 
              nombre: mockProyeccion.desarrollo_nombre || "Desarrollo" 
            });
          }
        } catch (error) {
          console.error("Error fetching proyeccion:", error);
          toast({
            title: "Error",
            description: "Failed to load proyeccion data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchProyeccion();
    }
  }, [proyeccionId, selectedDesarrolloId, toast]);

  useEffect(() => {
    const fetchDesarrollos = async () => {
      try {
        const { data, error } = await supabase
          .from('desarrollos')
          .select('id, nombre');

        if (error) {
          console.error("Error fetching desarrollos:", error);
          toast({
            title: "Error",
            description: "Failed to load desarrollos data.",
            variant: "destructive",
          });
        }

        setDesarrollos(data || []);
      } catch (error) {
        console.error("Unexpected error fetching desarrollos:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading desarrollos data.",
          variant: "destructive",
        });
      }
    };

    fetchDesarrollos();
  }, [toast]);

  const handleDesarrolloChange = async (desarrolloId: string) => {
    const selected = desarrollos.find(d => d.id === desarrolloId);
    setSelectedDesarrollo(selected || null);

    // Call the parent handler if provided
    if (onDesarrolloChange) {
      onDesarrolloChange(desarrolloId);
    }

    // Simulate updating a proyeccion in database
    if (proyeccionId && selected) {
      toast({
        title: "Success",
        description: "Proyeccion updated successfully with the new desarrollo.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-80" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show different content based on whether we're viewing an existing proyeccion or generating a new one
  const displayData = proyeccion || {
    inversion_inicial: summaryData?.propertyValue || 0,
    ingresos_totales: summaryData?.airbnbProfit || 0,
    gastos_totales: summaryData?.altReturn || 0,
    beneficio_neto: summaryData?.airbnbProfit - summaryData?.altReturn || 0,
    tir: summaryData?.avgROI || 0,
    payback: 4 // Default value
  };

  const chartDataToDisplay = chartData || [
    { name: 'Ingresos', value: displayData.ingresos_totales },
    { name: 'Gastos', value: displayData.gastos_totales },
    { name: 'Beneficio Neto', value: displayData.beneficio_neto },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Proyección Financiera
        </CardTitle>
        <CardDescription>
          Análisis detallado de la proyección financiera.
        </CardDescription>
      </CardHeader>
      <CardContent id="proyeccion-content">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Detalles</h3>
          <p>Inversión Inicial: {formatCurrency(displayData.inversion_inicial)}</p>
          <p>Ingresos Totales: {formatCurrency(displayData.ingresos_totales)}</p>
          <p>Gastos Totales: {formatCurrency(displayData.gastos_totales)}</p>
          <p>Beneficio Neto: {formatCurrency(displayData.beneficio_neto)}</p>
          <p>TIR: {displayData.tir}%</p>
          <p>Payback: {displayData.payback} años</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Desarrollo Asociado</h3>
          <Select onValueChange={handleDesarrolloChange} value={selectedDesarrollo?.id || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un desarrollo" />
            </SelectTrigger>
            <SelectContent>
              {desarrollos.map((desarrollo) => (
                <SelectItem key={desarrollo.id} value={desarrollo.id}>
                  {desarrollo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDesarrollo && <p>Desarrollo seleccionado: {selectedDesarrollo.nombre}</p>}
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Gráfico de Resultados</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartDataToDisplay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <div className="flex justify-end space-x-2 p-4">
        <ExportPDFButton
          cotizacionId="placeholder"
          leadName="Proyección"
          desarrolloNombre={selectedDesarrollo?.nombre || "Desarrollo"}
          prototipoNombre="Análisis"
          buttonText="Exportar PDF"
          resourceName="proyección"
          fileName={fileName || `Proyeccion_${selectedDesarrollo?.nombre || 'Desarrollo'}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}`}
          elementId="proyeccion-content"
          className="ml-2"
          variant="default"
        />
      </div>
    </Card>
  );
};

export default ProyeccionView;
