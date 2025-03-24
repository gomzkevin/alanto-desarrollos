import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useOrganizationUsers, OrganizationUser } from '@/hooks/useOrganizationUsers';
import { useUserTransfer } from '@/hooks/useUserTransfer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DataTableProps {
  columns: ColumnDef<OrganizationUser>[];
  data: OrganizationUser[];
}

const DataTable: React.FC<DataTableProps> = ({ columns, data }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full table-auto text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} className="px-4 py-2 text-left [&:not([:first-child])]:pl-6">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b transition-colors hover:bg-muted data-[state=selected]:bg-muted">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 [&:not([:first-child])]:pl-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export function UserManagementTable() {
  const {
    users,
    isLoading,
    error,
    deleteUser,
    reactivateUser,
    canManageUsers,
    toggleUserStatus,
    updateUserRole
  } = useOrganizationUsers();
  const { transferUser } = useUserTransfer();
  const [isUpdating, setIsUpdating] = useState(false);

  const columns: ColumnDef<OrganizationUser>[] = [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Avatar className="mr-2.5 h-8 w-8">
            <AvatarImage src={`https://avatar.vercel.sh/${row.original.email}.png`} />
            <AvatarFallback>{row.getValue('nombre')?.toString().substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {row.getValue('nombre')}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <Select 
            value={user.rol} 
            onValueChange={(newRole) => {
              if (newRole === 'admin' || newRole === 'vendedor') {
                updateUserRole(user.id, newRole);
              }
            }}
            disabled={!canManageUsers || isUpdating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="vendedor">Vendedor</SelectItem>
            </SelectContent>
          </Select>
        );
      }
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Checkbox
            checked={user.activo}
            onCheckedChange={(checked) => {
              setIsUpdating(true);
              toggleUserStatus(user.id, checked)
                .finally(() => setIsUpdating(false));
            }}
            disabled={!canManageUsers || isUpdating}
          />
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const user = row.original;
        const [open, setOpen] = React.useState(false)

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
              <DropdownMenuItem disabled={!canManageUsers}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user.activo ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-500" disabled={!canManageUsers}>
                      <Trash2 className="mr-2 h-4 w-4" /> Desactivar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción desactivará al usuario.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          setIsUpdating(true);
                          deleteUser.mutate(user.id, {
                            onSettled: () => setIsUpdating(false),
                          });
                        }}
                        disabled={isUpdating}
                      >
                        Desactivar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setIsUpdating(true);
                    reactivateUser.mutate(user.id, {
                      onSettled: () => setIsUpdating(false),
                    });
                  }}
                  disabled={!canManageUsers || isUpdating}
                >
                  Reactivar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
        <CardDescription>Gestiona los usuarios de tu organización.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Cargando usuarios...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </CardContent>
    </Card>
  );
}
