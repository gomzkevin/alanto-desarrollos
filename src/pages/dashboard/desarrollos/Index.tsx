import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PlusCircle, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/integrations/supabase/client';
import { useDesarrollos } from '@/hooks/useDesarrollos';
import { useUserRole } from '@/hooks/useUserRole';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RequireSubscription from '@/components/auth/RequireSubscription';

const DesarrollosPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { empresaId } = useUserRole();
  const navigate = useNavigate();

  const {
    data: desarrollos,
    isLoading,
    error,
    refetch,
  } = useDesarrollos({ empresa_id: empresaId });

  const queryClient = useQueryClient();
  const { mutate: createDesarrolloMutation, isLoading: isCreating } = useMutation(
    async (data: any) => {
      const { data: response, error } = await supabase
        .from('desarrollos')
        .insert([data])
        .select();

      if (error) {
        console.error("Error creating desarrollo:", error);
        throw error;
      }

      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['desarrollos']);
        refetch();
      },
    }
  );

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  // Fix the type issue in createDesarrollo
  const createDesarrollo = async (formData: any) => {
    try {
      setIsSubmitting(true);
      
      // Ensure required fields have values
      const preparedData = {
        ...formData,
        fecha_inicio: formData.fecha_inicio || new Date().toISOString(),
        empresa_id: empresaId,
        total_unidades: formData.total_unidades || 0,
        unidades_disponibles: formData.unidades_disponibles || 0
      };
      
      await createDesarrolloMutation.mutateAsync(preparedData);
      
      toast({
        title: "Desarrollo creado",
        description: "El desarrollo ha sido creado exitosamente"
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating desarrollo:", error);
      toast({
        title: "Error",
        description: `No se pudo crear el desarrollo: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRowClick = (desarrolloId: string) => {
    navigate(`/dashboard/desarrollos/${desarrolloId}`);
  };

  return (
    <RequireSubscription moduleName="Desarrollos">
      <DashboardLayout>
        <div className="container py-10">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Desarrollos</h1>
            <Button onClick={openDialog} disabled={isCreating || isSubmitting}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Desarrollo
            </Button>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Lista de Desarrollos</CardTitle>
              <CardDescription>
                Administra tus desarrollos y su información.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error.message || "Failed to fetch desarrollos."}
                  </AlertDescription>
                </Alert>
              ) : desarrollos && desarrollos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Total Unidades</TableHead>
                      <TableHead>Unidades Disponibles</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {desarrollos.map((desarrollo) => (
                      <TableRow key={desarrollo.id} onClick={() => handleRowClick(desarrollo.id)} className="cursor-pointer hover:bg-muted">
                        <TableCell className="font-medium">{desarrollo.nombre}</TableCell>
                        <TableCell>{desarrollo.ubicacion}</TableCell>
                        <TableCell>{desarrollo.total_unidades}</TableCell>
                        <TableCell>{desarrollo.unidades_disponibles}</TableCell>
                        <TableCell>{new Date(desarrollo.fecha_inicio).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sin Desarrollos</AlertTitle>
                  <AlertDescription>
                    No hay desarrollos creados aún.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Dialog */}
          {isDialogOpen && (
            <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
              <div className="container flex items-center justify-center min-h-screen">
                <Card className="max-w-md w-full">
                  <CardHeader>
                    <CardTitle>Crear Desarrollo</CardTitle>
                    <CardDescription>
                      Ingresa la información del nuevo desarrollo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = {
                          nombre: (e.target.elements.nombre as HTMLInputElement).value,
                          ubicacion: (e.target.elements.ubicacion as HTMLInputElement).value,
                          total_unidades: parseInt((e.target.elements.total_unidades as HTMLInputElement).value),
                          unidades_disponibles: parseInt((e.target.elements.unidades_disponibles as HTMLInputElement).value),
                          fecha_inicio: (e.target.elements.fecha_inicio as HTMLInputElement).value,
                        };
                        await createDesarrollo(formData);
                      }}
                    >
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="nombre">Nombre</Label>
                          <Input id="nombre" type="text" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="ubicacion">Ubicación</Label>
                          <Input id="ubicacion" type="text" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="total_unidades">Total Unidades</Label>
                          <Input
                            id="total_unidades"
                            type="number"
                            defaultValue={0}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="unidades_disponibles">Unidades Disponibles</Label>
                          <Input
                            id="unidades_disponibles"
                            type="number"
                            defaultValue={0}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                          <Input id="fecha_inicio" type="date" required />
                        </div>
                        <Button type="submit" disabled={isSubmitting || isCreating}>
                          {isSubmitting || isCreating ? "Creando..." : "Crear"}
                        </Button>
                      </div>
                    </form>
                    <Button
                      variant="ghost"
                      className="mt-4"
                      onClick={closeDialog}
                      disabled={isSubmitting || isCreating}
                    >
                      Cancelar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RequireSubscription>
  );
};

export default DesarrollosPage;
