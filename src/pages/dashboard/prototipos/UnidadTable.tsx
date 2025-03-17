
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Unidad } from '@/hooks/useUnidades';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import useUnidades from '@/hooks/useUnidades';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import UnidadEditDialog from '@/components/dashboard/UnidadForm/UnidadEditDialog';

type Prototipo = Tables<"prototipos">;

interface UnidadTableProps {
  unidades: Unidad[];
  isLoading: boolean;
  onRefresh: () => void;
  prototipo: Prototipo;
}

export const UnidadTable = ({ unidades, isLoading, onRefresh, prototipo }: UnidadTableProps) => {
  const [unidadToEdit, setUnidadToEdit] = useState<string | null>(null);
  const [unidadToDelete, setUnidadToDelete] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<Record<string, boolean>>({});
  
  const { deleteUnidad, updateUnidad } = useUnidades();
  const { toast } = useToast();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponible':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disponible</Badge>;
      case 'apartado':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Apartado</Badge>;
      case 'en_proceso':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">En Proceso</Badge>;
      case 'vendido':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Vendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleUpdateStatus = async (unidadId: string, nuevoEstado: string) => {
    setStatusUpdateLoading(prev => ({ ...prev, [unidadId]: true }));
    
    try {
      await updateUnidad.mutateAsync({
        id: unidadId,
        estado: nuevoEstado
      });
      
      onRefresh();
      
      toast({
        title: 'Estado actualizado',
        description: `La unidad ha sido actualizada a "${nuevoEstado}"`,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la unidad',
        variant: 'destructive',
      });
    } finally {
      setStatusUpdateLoading(prev => ({ ...prev, [unidadId]: false }));
    }
  };
  
  const handleDelete = async () => {
    if (!unidadToDelete) return;
    
    try {
      await deleteUnidad.mutateAsync(unidadToDelete);
      setUnidadToDelete(null);
      onRefresh();
      
      toast({
        title: 'Unidad eliminada',
        description: 'La unidad ha sido eliminada correctamente',
      });
    } catch (error) {
      console.error('Error deleting unidad:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la unidad',
        variant: 'destructive',
      });
    }
  };
  
  const handleEditClick = (id: string) => {
    console.log('Opening edit dialog for unidad ID:', id);
    setUnidadToEdit(id);
  };
  
  const handleCloseDialog = () => {
    console.log('Closing edit dialog');
    setUnidadToEdit(null);
  };
  
  const handleSuccessEdit = () => {
    console.log('Edit successful, refreshing data');
    setUnidadToEdit(null);
    onRefresh();
    
    toast({
      title: 'Unidad actualizada',
      description: 'La unidad ha sido actualizada correctamente',
    });
  };
  
  if (isLoading) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-slate-500">Cargando unidades...</p>
      </div>
    );
  }
  
  if (unidades.length === 0) {
    return (
      <div className="w-full py-10 text-center">
        <p className="text-slate-500">No hay unidades disponibles.</p>
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Fecha Venta</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unidades.map((unidad) => (
            <TableRow key={unidad.id}>
              <TableCell className="font-medium">{unidad.numero}</TableCell>
              <TableCell>{unidad.nivel || '-'}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0">
                      {getStatusBadge(unidad.estado)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleUpdateStatus(unidad.id, 'disponible')}
                      disabled={unidad.estado === 'disponible' || statusUpdateLoading[unidad.id]}
                    >
                      Disponible
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleUpdateStatus(unidad.id, 'apartado')}
                      disabled={unidad.estado === 'apartado' || statusUpdateLoading[unidad.id]}
                    >
                      Apartado
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleUpdateStatus(unidad.id, 'en_proceso')}
                      disabled={unidad.estado === 'en_proceso' || statusUpdateLoading[unidad.id]}
                    >
                      En Proceso
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleUpdateStatus(unidad.id, 'vendido')}
                      disabled={unidad.estado === 'vendido' || statusUpdateLoading[unidad.id]}
                    >
                      Vendido
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell>{unidad.comprador_nombre || '-'}</TableCell>
              <TableCell>{unidad.precio_venta ? `$${unidad.precio_venta.toLocaleString()}` : '-'}</TableCell>
              <TableCell>{unidad.fecha_venta 
                ? new Date(unidad.fecha_venta).toLocaleDateString() 
                : '-'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditClick(unidad.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setUnidadToDelete(unidad.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {unidadToEdit && (
        <UnidadEditDialog
          unidadId={unidadToEdit}
          open={!!unidadToEdit}
          onClose={handleCloseDialog}
          onSuccess={handleSuccessEdit}
          prototipo_id={prototipo.id}
        />
      )}
      
      <AlertDialog open={!!unidadToDelete} onOpenChange={(open) => !open && setUnidadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la unidad.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
