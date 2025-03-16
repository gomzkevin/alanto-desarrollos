import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, FileText, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type Unidad = Tables<"unidades">;
type Prototipo = Tables<"prototipos">;

interface UnidadTableProps {
  unidades: Unidad[];
  isLoading: boolean;
  onRefresh: () => void;
  prototipo: Prototipo;
}

export function UnidadTable({ unidades, isLoading, onRefresh, prototipo }: UnidadTableProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedUnidad, setSelectedUnidad] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>;
      case 'apartado':
        return <Badge className="bg-yellow-100 text-yellow-800">Apartado</Badge>;
      case 'en_proceso':
        return <Badge className="bg-blue-100 text-blue-800">En proceso</Badge>;
      case 'en_pagos':
        return <Badge className="bg-purple-100 text-purple-800">En pagos</Badge>;
      case 'vendido':
        return <Badge className="bg-gray-100 text-gray-800">Vendido</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };
  
  const handleDelete = async () => {
    if (!selectedUnidad) return;
    
    try {
      const { error } = await supabase
        .from('unidades')
        .delete()
        .eq('id', selectedUnidad);
      
      if (error) throw error;
      
      toast({
        title: 'Unidad eliminada',
        description: 'La unidad ha sido eliminada correctamente',
      });
      
      // Actualizar unidades disponibles en el prototipo
      const unidad = unidades.find(u => u.id === selectedUnidad);
      if (unidad && unidad.estado === 'disponible' && prototipo.id) {
        await supabase
          .from('prototipos')
          .update({ 
            unidades_disponibles: (prototipo.unidades_disponibles || 0) - 1 
          })
          .eq('id', prototipo.id);
      }
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Error al eliminar la unidad: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedUnidad(null);
    }
  };
  
  const handleCotizacion = (unidadId: string) => {
    const unidad = unidades.find(u => u.id === unidadId);
    if (!unidad) return;
    
    if (!prototipo || !prototipo.desarrollo_id) {
      toast({
        title: "Error",
        description: "No se encontró información completa del prototipo",
        variant: "destructive"
      });
      return;
    }
    
    // Add console logs for debugging
    console.log("Preparando navegación a cotización con params:", {
      unidadId,
      prototipoId: prototipo.id,
      desarrolloId: prototipo.desarrollo_id
    });
    
    // Navigate directly to the cotización page - simplified and more reliable approach
    navigate(`/dashboard/cotizaciones/nueva?desarrollo=${prototipo.desarrollo_id}&prototipo=${prototipo.id}&unidad=${unidadId}`);
  };
  
  const handleProyeccion = (unidadId: string) => {
    navigate(`/dashboard/proyecciones?unidad=${unidadId}`);
  };
  
  if (isLoading) {
    return (
      <div className="w-full py-10">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }
  
  if (unidades.length === 0) {
    return (
      <div className="w-full rounded-md border border-dashed p-10 text-center">
        <h3 className="text-lg font-medium">No hay unidades</h3>
        <p className="text-sm text-gray-500 mt-1">
          No hay unidades registradas en este prototipo con los filtros seleccionados.
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nivel</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Comprador</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unidades.map((unidad) => (
              <TableRow key={unidad.id}>
                <TableCell className="font-medium">{unidad.numero}</TableCell>
                <TableCell>{unidad.nivel || '-'}</TableCell>
                <TableCell>{getEstadoBadge(unidad.estado)}</TableCell>
                <TableCell>{unidad.precio_venta ? formatCurrency(unidad.precio_venta) : '-'}</TableCell>
                <TableCell>{unidad.comprador_nombre || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUnidad(unidad.id);
                        setOpenEditDialog(true);
                      }}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    
                    {unidad.estado === 'disponible' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCotizacion(unidad.id)}
                        className="flex items-center gap-1"
                        type="button"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">Cotizar</span>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProyeccion(unidad.id)}
                      type="button"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="sr-only">Proyección</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setSelectedUnidad(unidad.id);
                        setOpenDeleteDialog(true);
                      }}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <AdminResourceDialog 
        resourceType="unidades"
        resourceId={selectedUnidad || undefined}
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedUnidad(null);
        }}
        onSuccess={onRefresh}
      />
      
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta unidad
              del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
