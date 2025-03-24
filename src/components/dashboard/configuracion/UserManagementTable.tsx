import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, UserPlus, UserCog } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import useOrganizationUsers from "@/hooks/useOrganizationUsers";
import useInvitaciones from "@/hooks/useInvitaciones";
import { format, formatDistance } from "date-fns";
import { es } from "date-fns/locale";

function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function UserManagementTable() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    rol: "vendedor",
  });
  const [inviteErrors, setInviteErrors] = useState<{
    email?: string;
    rol?: string;
  }>({});

  const { isAdmin } = useUserRole();

  const {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    error: usersError,
  } = useOrganizationUsers({});

  const {
    invitaciones,
    isLoading: isInvitacionesLoading,
    createInvitacion,
    deleteInvitacion,
    resendInvitacion,
  } = useInvitaciones();

  const validateInviteForm = () => {
    const errors: { email?: string; rol?: string } = {};
    let isValid = true;

    if (!inviteForm.email) {
      errors.email = "El email es obligatorio";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(inviteForm.email)
    ) {
      errors.email = "Email inválido";
      isValid = false;
    }

    if (!inviteForm.rol) {
      errors.rol = "El rol es obligatorio";
      isValid = false;
    }

    setInviteErrors(errors);
    return isValid;
  };

  const handleInvite = () => {
    if (!validateInviteForm()) return;

    createInvitacion.mutate(
      {
        email: inviteForm.email,
        rol: inviteForm.rol,
      },
      {
        onSuccess: () => {
          setIsInviteOpen(false);
          setInviteForm({
            email: "",
            rol: "vendedor",
          });
        },
      }
    );
  };

  const handleResendInvite = (invitacionId: string) => {
    resendInvitacion.mutate(invitacionId, {
      onSuccess: () => {
        toast({
          title: "Invitación reenviada",
          description: "Se ha reenviado la invitación con éxito.",
        });
      },
    });
  };

  const handleCancelInvite = (invitacionId: string) => {
    deleteInvitacion.mutate(invitacionId, {
      onSuccess: () => {
        toast({
          title: "Invitación cancelada",
          description: "La invitación ha sido cancelada.",
        });
      },
    });
  };

  const isLoading = isLoading || isInvitacionesLoading;
  const hasInvitations = invitaciones && invitaciones.length > 0;
  const hasUsers = users && users.length > 0;

  const handleChangeRole = (userId: string, newRole: string) => {
    updateUser.mutate(
      { id: userId, data: { rol: newRole } },
      {
        onSuccess: () => {
          toast({
            title: "Rol actualizado",
            description: "El rol del usuario ha sido actualizado con éxito.",
          });
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `No se pudo actualizar el rol: ${error.message}`,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {isAdmin() && (
        <div className="flex justify-end">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invitar usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar nuevo usuario</DialogTitle>
                <DialogDescription>
                  Envía una invitación por correo electrónico al nuevo usuario.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    placeholder="usuario@ejemplo.com"
                    className={inviteErrors.email ? "border-red-500" : ""}
                  />
                  {inviteErrors.email && (
                    <p className="text-sm text-red-500">{inviteErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={inviteForm.rol}
                    onValueChange={(value) =>
                      setInviteForm({ ...inviteForm, rol: value })
                    }
                  >
                    <SelectTrigger
                      className={inviteErrors.rol ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                    </SelectContent>
                  </Select>
                  {inviteErrors.rol && (
                    <p className="text-sm text-red-500">{inviteErrors.rol}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleInvite}
                  disabled={createInvitacion.isPending}
                >
                  {createInvitacion.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar invitación"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Table>
            <TableCaption>Miembros del equipo</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasUsers &&
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nombre}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {isAdmin() ? (
                        <Select
                          value={user.rol}
                          onValueChange={(newRole) =>
                            handleChangeRole(user.id, newRole)
                          }
                          disabled={updateUser.isPending || !isBoolean(user.activo) || !user.activo}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="vendedor">Vendedor</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant={
                            user.rol === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.rol === "admin"
                            ? "Administrador"
                            : user.rol === "vendedor"
                            ? "Vendedor"
                            : user.rol}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.activo ? "outline" : "destructive"
                        }
                      >
                        {user.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin() && (
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
                            <DropdownMenuItem
                              onClick={() =>
                                toast({
                                  title: "Info",
                                  description:
                                    "Esta función estará disponible pronto.",
                                })
                              }
                            >
                              Gestionar permisos
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateUser.mutate({
                                  id: user.id,
                                  data: { activo: !user.activo },
                                })
                              }
                            >
                              {user.activo
                                ? "Desactivar usuario"
                                : "Activar usuario"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {hasInvitations && (
            <>
              <h3 className="text-lg font-medium mt-8 mb-4">
                Invitaciones pendientes
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de expiración</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitaciones
                    .filter((inv) => inv.estado === "pendiente")
                    .map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          {invitation.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invitation.rol === "admin"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {invitation.rol === "admin"
                              ? "Administrador"
                              : invitation.rol === "vendedor"
                              ? "Vendedor"
                              : invitation.rol}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invitation.fecha_expiracion
                            ? format(
                                new Date(invitation.fecha_expiracion),
                                "PPP",
                                { locale: es }
                              )
                            : "N/A"}
                          <p className="text-xs text-gray-500">
                            {invitation.fecha_expiracion &&
                              formatDistance(
                                new Date(invitation.fecha_expiracion),
                                new Date(),
                                {
                                  addSuffix: true,
                                  locale: es,
                                }
                              )}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleResendInvite(invitation.id)
                              }
                              disabled={resendInvitacion.isPending}
                            >
                              Reenviar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleCancelInvite(invitation.id)
                              }
                              disabled={deleteInvitacion.isPending}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </>
          )}

          {!hasUsers && !hasInvitations && (
            <div className="text-center py-8">
              <UserCog className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No hay usuarios
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza invitando a miembros a tu organización.
              </p>
              {isAdmin() && (
                <div className="mt-6">
                  <Button
                    onClick={() => setIsInviteOpen(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invitar usuario
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserManagementTable;
