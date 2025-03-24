
import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useOrganizationUsers, OrganizationUser } from '@/hooks/useOrganizationUsers';
import { UserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableViewProps {
  data: OrganizationUser[];
}

// Componente para seleccionar el rol de un usuario
const RoleSelect = ({ currentRole, userId, onRoleChange }: {
  currentRole: UserRole;
  userId: string;
  onRoleChange: (id: string, newRole: UserRole) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Función para actualizar el rol
  const handleRoleChange = (role: UserRole) => {
    onRoleChange(userId, role);
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Badge variant={
            currentRole === 'admin' ? "default" : 
            currentRole === 'superadmin' ? "destructive" :
            currentRole === 'vendedor' ? "secondary" : 
            "outline"
          }>
            {currentRole === 'admin' ? "Administrador" : 
             currentRole === 'superadmin' ? "Super Admin" :
             currentRole === 'vendedor' ? "Vendedor" : 
             "Cliente"}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No hay roles disponibles</CommandEmpty>
            <CommandGroup>
              <CommandItem 
                onSelect={() => handleRoleChange('admin')}
                className="flex items-center gap-2"
              >
                <Badge variant="default">Administrador</Badge>
              </CommandItem>
              <CommandItem 
                onSelect={() => handleRoleChange('vendedor')}
                className="flex items-center gap-2"
              >
                <Badge variant="secondary">Vendedor</Badge>
              </CommandItem>
              <CommandItem 
                onSelect={() => handleRoleChange('cliente')}
                className="flex items-center gap-2"
              >
                <Badge variant="outline">Cliente</Badge>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export function UserManagementTable() {
  const {
    users,
    isLoading,
    error,
    refetch,
    toggleUserStatus,
    updateUserRole
  } = useOrganizationUsers();

  // Fix the type error with the mutation function
  const handleRoleChange = (id: string, newRole: UserRole) => {
    updateUserRole.mutate({ id, newRole });
  };

  const columns: ColumnDef<OrganizationUser>[] = [
    {
      accessorKey: 'nombre',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => (
        <RoleSelect 
          currentRole={row.original.rol}
          userId={row.original.id}
          onRoleChange={handleRoleChange}
        />
      ),
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => {
        const isActive = row.original.activo;
        return (
          <Badge variant={isActive ? 'success' : 'destructive'}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  toggleUserStatus.mutate({
                    id: user.id,
                    currentStatus: user.activo,
                  })
                }
              >
                {user.activo ? 'Desactivar' : 'Activar'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Ver detalles</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="container mx-auto py-10">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Sin resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default UserManagementTable;
