
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Pago } from '@/hooks/useVentas';
import { formatCurrency } from '@/lib/utils';

interface PagosTableProps {
  pagos: Pago[];
  onUpdateEstado: (params: { pagoId: string; estado: string }) => void;
  isLoading: boolean;
}

const PagosTable = ({
  pagos,
  onUpdateEstado,
  isLoading
}: PagosTableProps) => {
  // Ordenar pagos por fecha (más recientes primero)
  const pagosSorted = [...pagos].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // Renderizar badge de estado
  const renderEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'registrado':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Registrado</Badge>;
      case 'verificado':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Verificado</Badge>;
      case 'rechazado':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  // Renderizar método de pago
  const renderMetodoPago = (metodo: string) => {
    switch (metodo) {
      case 'transferencia':
        return 'Transferencia';
      case 'efectivo':
        return 'Efectivo';
      case 'cheque':
        return 'Cheque';
      case 'tarjeta':
        return 'Tarjeta';
      default:
        return metodo;
    }
  };

  // Si no hay pagos mostrar mensaje
  if (pagos.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">No hay pagos registrados</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
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
          {pagosSorted.map(pago => (
            <TableRow key={pago.id}>
              <TableCell>
                {new Date(pago.fecha).toLocaleDateString('es-MX')}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(pago.monto)}
              </TableCell>
              <TableCell>
                {renderMetodoPago(pago.metodo_pago)}
              </TableCell>
              <TableCell>
                <div className="max-w-[120px] truncate">
                  {pago.referencia || '-'}
                </div>
              </TableCell>
              <TableCell>
                {renderEstadoBadge(pago.estado)}
              </TableCell>
              <TableCell className="text-right">
                {pago.estado === 'registrado' && (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-500 hover:text-green-600 hover:bg-green-50"
                      onClick={() => onUpdateEstado({ pagoId: pago.id, estado: 'verificado' })}
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onUpdateEstado({ pagoId: pago.id, estado: 'rechazado' })}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {pago.estado === 'rechazado' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-500 hover:text-green-600 hover:bg-green-50"
                    onClick={() => onUpdateEstado({ pagoId: pago.id, estado: 'verificado' })}
                    disabled={isLoading}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PagosTable;
