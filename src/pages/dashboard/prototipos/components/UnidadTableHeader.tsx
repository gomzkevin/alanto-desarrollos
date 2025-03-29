
import React from 'react';
import { TableRow, TableHead } from "@/components/ui/table";

const UnidadTableHeader = () => {
  return (
    <TableRow>
      <TableHead>Número</TableHead>
      <TableHead>Nivel</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead>Precio</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
  );
};

export default UnidadTableHeader;
