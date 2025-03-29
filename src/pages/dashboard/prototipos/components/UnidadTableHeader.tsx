
import React from 'react';
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const UnidadTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Número/ID</TableHead>
        <TableHead>Nivel</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Precio de Lista</TableHead>
        <TableHead className="text-right">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UnidadTableHeader;
