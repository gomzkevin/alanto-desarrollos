import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Proyeccion } from '../types';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';

interface ProyeccionViewProps {
  proyeccionId: string;
}

interface Desarrollo {
  id: string;
  nombre: string;
}

const ProyeccionView: React.FC<ProyeccionViewProps> = ({ proyeccionId }) => {
  const [proyeccion, setProyeccion] = useState<Proyeccion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDesarrollo, setSelectedDesarrollo] = useState<Desarrollo | null>(null);
  const [desarrollos, setDesarrollos] = useState<Desarrollo[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProyeccion = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('proyecciones')
          .select('*')
          .eq('id', proyeccionId)
          .single();

        if (error) {
          console.error("Error fetching proyeccion:", error);
          toast({
            title: "Error",
            description: "Failed to load proyeccion data.",
            variant: "destructive",
          });
        }

        setProyeccion(data);
        if (data?.desarrollo_id) {
          setSelectedDesarrollo({ id: data.desarrollo_id, nombre: data.desarrollo_nombre });
        }
      } catch (error) {
        console.error("Unexpected error fetching proyeccion:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading proyeccion data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProyeccion();
  }, [proyeccionId, toast]);

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

    // Optimistically update the state
    setProyeccion(prevProyeccion => ({
      ...prevProyeccion,
      desarrollo_id: desarrolloId,
      desarrollo_nombre: selected ? selected.nombre : null,
    } as Proyeccion));

    try {
      const { error } = await supabase
        .from('proyecciones')
        .update({ desarrollo_id: desarrolloId, desarrollo_nombre: selected?.nombre })
        .eq('id', proyeccionId);

      if (error) {
        console.error("Error updating proyeccion:", error);
        toast({
          title: "Error",
          description: "Failed to update proyeccion with the new desarrollo.",
          variant: "destructive",
        });

        // Revert the state on failure
        setProyeccion(prevProyeccion => ({
          ...prevProyeccion,
          desarrollo_id: null,
          desarrollo_nombre: null,
        } as Proyeccion));
        setSelectedDesarrollo(null);
      } else {
        toast({
          title: "Success",
          description: "Proyeccion updated successfully with the new desarrollo.",
        });
      }
    } catch (error) {
      console.error("Unexpected error updating proyeccion:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the proyeccion.",
        variant: "destructive",
      });

      // Revert the state on unexpected error
      setProyeccion(prevProyeccion => ({
        ...prevProyeccion,
        desarrollo_id: null,
        desarrollo_nombre: null,
      } as Proyeccion));
      setSelectedDesarrollo(null);
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

  if (!proyeccion) {
    return (
      <Card>
        <CardContent>No se encontró la proyección.</CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: 'Ingresos', value: proyeccion.ingresos_totales },
    { name: 'Gastos', value: proyeccion.gastos_totales },
    { name: 'Beneficio Neto', value: proyeccion.beneficio_neto },
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
          <p>Inversión Inicial: {formatCurrency(proyeccion.inversion_inicial)}</p>
          <p>Ingresos Totales: {formatCurrency(proyeccion.ingresos_totales)}</p>
          <p>Gastos Totales: {formatCurrency(proyeccion.gastos_totales)}</p>
          <p>Beneficio Neto: {formatCurrency(proyeccion.beneficio_neto)}</p>
          <p>TIR: {proyeccion.tir}%</p>
          <p>Payback: {proyeccion.payback} años</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Desarrollo Asociado</h3>
          <Select onValueChange={handleDesarrolloChange} defaultValue={selectedDesarrollo?.id || ""}>
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
            <BarChart data={chartData}>
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
          fileName={`Proyeccion_${selectedDesarrollo?.nombre || 'Desarrollo'}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}`}
          elementId="proyeccion-content"
          className="ml-2"
          variant="default"
        />
      </div>
    </Card>
  );
};

export default ProyeccionView;
