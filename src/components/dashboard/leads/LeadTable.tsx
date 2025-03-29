
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, ArrowUpDown } from 'lucide-react';
import { LeadStatusBadge } from '@/components/dashboard/LeadStatusBadge';
import { formatDate } from '@/lib/utils';

interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  estado: string;
  fecha_creacion: string;
}

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  sortOrder: 'asc' | 'desc';
  sortBy: 'created_at' | 'nombre';
  onSort: (field: 'created_at' | 'nombre') => void;
  onEdit: (leadId: string) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  isLoading,
  sortOrder,
  sortBy,
  onSort,
  onEdit
}) => {
  if (isLoading) {
    return <div className="py-4 text-center">Cargando leads...</div>;
  }

  if (leads.length === 0) {
    return <div className="py-4 text-center">No hay leads disponibles.</div>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('nombre')}
            >
              <div className="flex items-center gap-1">
                Nombre
                {sortBy === 'nombre' && (
                  <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
                )}
              </div>
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('created_at')}
            >
              <div className="flex items-center gap-1">
                Fecha
                {sortBy === 'created_at' && (
                  <ArrowUpDown size={16} className={sortOrder === 'asc' ? 'rotate-180' : ''} />
                )}
              </div>
            </TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.nombre}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.telefono}</TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.estado} />
              </TableCell>
              <TableCell>{formatDate(lead.fecha_creacion)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onEdit(lead.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadTable;
