
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { PagoDialog } from "./PagoDialog";
import { PagoEditDialog } from "./PagoEditDialog";
import { Pago } from "@/hooks/usePagos";

interface PagosTabProps {
  ventaId: string;
  compradorVentaId: string;
  pagos: Pago[];
  isLoading: boolean;
  refetchPagos: () => void;
}

export const PagosTab = ({ ventaId, compradorVentaId, pagos, isLoading, refetchPagos }: PagosTabProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'rechazado':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="success">Registrado</Badge>;
    }
  };
  
  const handleViewPago = (pago: Pago) => {
    setSelectedPago(pago);
    setOpenEditDialog(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Historial de Pagos</CardTitle>
          <Button 
            size="sm"
            onClick={() => setOpenDialog(true)}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" /> Registrar Pago
          </Button>
        </CardHeader>
        <CardContent>
          {pagos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No hay pagos registrados para esta venta
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell>{new Date(pago.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(pago.monto)}</TableCell>
                    <TableCell className="capitalize">{pago.metodo_pago.replace('_', ' ')}</TableCell>
                    <TableCell>{pago.referencia || '-'}</TableCell>
                    <TableCell>{getEstadoBadge(pago.estado)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewPago(pago)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <PagoDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        compradorVentaId={compradorVentaId}
        onSuccess={refetchPagos}
      />
      
      <PagoEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        pago={selectedPago}
        onSuccess={refetchPagos}
      />
    </div>
  );
};

export default PagosTab;
