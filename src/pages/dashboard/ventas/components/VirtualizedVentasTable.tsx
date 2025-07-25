import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Venta {
  id: string;
  unidad_numero?: string;
  prototipo_nombre?: string;
  desarrollo_nombre?: string;
  comprador_nombre?: string;
  precio_total: number;
  estado: string;
  fecha_inicio: string;
}

interface VirtualizedVentasTableProps {
  ventas: Venta[];
  onViewVenta: (venta: Venta) => void;
  height?: number;
}

const VentaRow = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: { ventas: Venta[]; onViewVenta: (venta: Venta) => void } 
}) => {
  const venta = data.ventas[index];
  
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={style} className="border-b border-border">
      <div className="grid grid-cols-7 gap-4 p-4 items-center">
        <div className="font-medium">#{venta.unidad_numero || 'N/A'}</div>
        <div>{venta.prototipo_nombre || 'N/A'}</div>
        <div>{venta.desarrollo_nombre || 'N/A'}</div>
        <div>{venta.comprador_nombre || 'Sin asignar'}</div>
        <div className="font-medium">{formatCurrency(venta.precio_total)}</div>
        <div>
          <Badge className={getStatusColor(venta.estado)}>
            {venta.estado}
          </Badge>
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => data.onViewVenta(venta)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

VentaRow.displayName = 'VentaRow';

export const VirtualizedVentasTable = memo<VirtualizedVentasTableProps>(({ 
  ventas, 
  onViewVenta, 
  height = 400 
}) => {
  if (ventas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay ventas para mostrar
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 p-4 bg-muted/50 font-medium">
        <div>Unidad</div>
        <div>Prototipo</div>
        <div>Desarrollo</div>
        <div>Comprador</div>
        <div>Precio</div>
        <div>Estado</div>
        <div>Acciones</div>
      </div>
      
      {/* Virtualized List */}
      <List
        height={height}
        width="100%"
        itemCount={ventas.length}
        itemSize={80}
        itemData={{ ventas, onViewVenta }}
      >
        {VentaRow}
      </List>
    </div>
  );
});

VirtualizedVentasTable.displayName = 'VirtualizedVentasTable';