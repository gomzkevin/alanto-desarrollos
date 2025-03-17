
import React from 'react';
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const UnidadTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Número/ID</TableHead>
        <TableHead>Nivel</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Precio</TableHead>
        <TableHead>Comprador</TableHead>
        <TableHead>Vendedor</TableHead>
        <TableHead>Fecha Venta</TableHead>
        <TableHead className="w-[80px]">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UnidadTableHeader;
