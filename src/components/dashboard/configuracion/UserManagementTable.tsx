import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MoreHorizontal, 
  Plus, 
  User, 
  Loader2, 
  Check, 
  AlertCircle, 
  X,
  UserPlus,
  Mail,
  CalendarClock,
  MailCheck,
  ExternalLink,
  MoveRight,
  History
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { signUpWithEmailPassword } from "@/services/authService";
import { useOrganizationUsers } from "@/hooks/useOrganizationUsers";
import { useInvitaciones, InvitationRole } from "@/hooks/useInvitaciones";
import { useUserTransfer } from "@/hooks/useUserTransfer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define a helper type for the roles that can be passed to signUpWithEmailPassword
type AuthServiceRole = 'admin' | 'vendedor' | 'cliente';

// Define a type that includes all roles, and subtypes for specific contexts:
type AllUserRoles = 'superadmin' | 'admin' | 'vendedor' | 'cliente';
type InvitationRoles = 'admin' | 'vendedor' | 'cliente'; // Roles that can be invited

export function UserManagementTable() {
  const [activeTab, setActiveTab] = useState<string>("usuarios");
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isTransferHistoryDialogOpen, setIsTransferHistoryDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    rol: "vendedor" as UserRole,
    password: "",
  });

  const [newInvite, setNewInvite] = useState({
    email: "",
    rol: "vendedor" as InvitationRole,
  });

  const [transferData, setTransferData] = useState({
    targetEmpresaId: 0,
    preserveRole: true,
    newRole: "vendedor" as UserRole,
  });

  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { isAdmin, empresaId, isSuperAdmin } = useUserRole();
  
  const { 
    users,
    isLoading: isLoadingUsers,
    toggleUserStatus,
    updateUserRole,
    companies,
    isLoadingCompanies
  } = useOrganizationUsers();

  const {
    invitaciones,
    isLoading: isLoadingInvites,
    createInvitacion,
    cancelarInvitacion,
    reenviarInvitacion,
    loading: inviteLoading
  } = useInvitaciones();

  const {
    transferUser,
    getTransferHistory,
    loading: transferLoading
  } = useUserTransfer();

  const validateUserForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newUser.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    }
    
    if (!newUser.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "El correo electrónico no es válido";
    }
    
    if (!newUser.password.trim()) {
      errors.password = "La contraseña es obligatoria";
    } else if (newUser.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateInviteForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newInvite.email.trim()) {
      errors.inviteEmail = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(newInvite.email)) {
      errors.inviteEmail = "El correo electrónico no es válido";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNewInviteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewInvite((prev) => ({ ...prev, [name]: value }));
    
    if (validationErrors.inviteEmail) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.inviteEmail;
        return newErrors;
      });
    }
  };

  const handleRoleChange = (value: string, formType: 'user' | 'invite' | 'transfer') => {
    if (formType === 'user') {
      setNewUser((prev) => ({ ...prev, rol: value as UserRole }));
    } else if (formType === 'invite') {
      setNewInvite((prev) => ({ ...prev, rol: value as InvitationRole }));
    } else if (formType === 'transfer') {
      setTransferData((prev) => ({ ...prev, newRole: value as UserRole }));
    }
  };

  const createNewUser = async () => {
    if (!isAdmin()) {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden crear usuarios.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateUserForm()) {
      return;
    }

    try {
      // Convert superadmin to admin for the auth service since it only accepts 
      // admin, vendedor, or cliente
      const roleForAuthService: AuthServiceRole = 
        newUser.rol === 'superadmin' ? 'admin' : 
        (newUser.rol as AuthServiceRole);
      
      const authResult = await signUpWithEmailPassword(
        newUser.email, 
        newUser.password, 
        empresaId || undefined, 
        roleForAuthService
      );

      if (!authResult.success) {
        throw new Error(authResult.error || "No se pudo crear el usuario");
      }

      setNewUser({
        nombre: "",
        email: "",
        rol: "vendedor" as UserRole,
        password: "",
      });
      setIsNewUserDialogOpen(false);

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear el usuario.",
        variant: "destructive",
      });
    }
  };

  const sendInvitation = async () => {
    if (!validateInviteForm()) {
      return;
    }

    // Ensure we're only passing valid invitation roles to createInvitacion
    const invitationRole: InvitationRoles = 
      (newInvite.rol === 'admin' || newInvite.rol === 'vendedor' || newInvite.rol === 'cliente' || newInvite.rol === 'superadmin') 
        ? newInvite.rol 
        : 'admin';
    
    const result = await createInvitacion(
      newInvite.email, 
      invitationRole
    );
    
    if (result.success) {
      setNewInvite({
        email: "",
        rol: "vendedor" as InvitationRole,
      });
      setIsInviteDialogOpen(false);
    }
  };

  const handleTransferUser = async () => {
    if (!selectedUserId || transferData.targetEmpresaId === 0) {
      toast({
        title: "Datos incompletos",
        description: "Por favor selecciona una empresa destino",
        variant: "destructive",
      });
      return;
    }

    const result = await transferUser({
      userId: selectedUserId,
      targetEmpresaId: transferData.targetEmpresaId,
      preserveRole: transferData.preserveRole,
      newRole: !transferData.preserveRole ? transferData.newRole : undefined
    });

    if (result.success) {
      setIsTransferDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const handleViewTransferHistory = async (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    
    const history = await getTransferHistory(userId);
    setTransferHistory(history);
    setIsTransferHistoryDialogOpen(true);
  };

  const getCompanyName = (id: number): string => {
    const company = companies?.find(c => c.id === id);
    return company ? company.nombre : `Empresa #${id}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "invitaciones":
        return renderInvitationsTable();
      case "usuarios":
      default:
        return renderUsersTable();
    }
  };

  const renderUsersTable = () => {
    if (isLoadingUsers) {
      return (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2">Cargando usuarios...</p>
        </div>
      );
    }

    if (!users || users.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <User className="h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold">No hay usuarios</h3>
          <p className="mt-2 text-sm text-slate-500">
            Aún no se han creado usuarios en el sistema.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.nombre}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.rol === 'admin' ? "default" : 
                            user.rol === 'superadmin' ? "destructive" : "outline"}
                  >
                    {user.rol === 'admin' ? 'Administrador' : 
                     user.rol === 'superadmin' ? 'Super Admin' : 
                     user.rol === 'vendedor' ? 'Vendedor' : 'Cliente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.activo ? "success" : "destructive"}
                    className="flex w-fit items-center"
                  >
                    {user.activo ? (
                      <>
                        <Check className="mr-1 h-3 w-3" /> Activo
                      </>
                    ) : (
                      <>
                        <X className="mr-1 h-3 w-3" /> Inactivo
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => toggleUserStatus.mutate({ id: user.id, currentStatus: user.activo })}
                      >
                        {user.activo ? 'Desactivar' : 'Activar'} Usuario
                      </DropdownMenuItem>
                      
                      {user.rol !== 'superadmin' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled={user.rol === 'admin'} 
                            onClick={() => updateUserRole.mutate({ id: user.id, newRole: 'admin' })}>
                            Cambiar a Administrador
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={user.rol === 'vendedor'} 
                            onClick={() => updateUserRole.mutate({ id: user.id, newRole: 'vendedor' })}>
                            Cambiar a Vendedor
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled={user.rol === 'cliente'} 
                            onClick={() => updateUserRole.mutate({ id: user.id, newRole: 'cliente' })}>
                            Cambiar a Cliente
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {isSuperAdmin() && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setIsTransferDialogOpen(true);
                            }}>
                            Transferir a otra empresa
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {user.empresa_anterior && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleViewTransferHistory(user.id, user.nombre)}>
                            Ver historial de transferencias
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderInvitationsTable = () => {
    if (isLoadingInvites) {
      return (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2">Cargando invitaciones...</p>
        </div>
      );
    }

    if (!invitaciones || invitaciones.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Mail className="h-10 w-10 text-slate-400" />
          <h3 className="mt-4 text-lg font-semibold">No hay invitaciones</h3>
          <p className="mt-2 text-sm text-slate-500">
            No se han enviado invitaciones a nuevos usuarios.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitaciones.map((invitacion) => {
              const isExpired = new Date(invitacion.fecha_expiracion) < new Date();
              const isPending = invitacion.estado === 'pendiente';
              
              return (
                <TableRow key={invitacion.id}>
                  <TableCell className="font-medium">{invitacion.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {invitacion.rol === 'admin' ? 'Administrador' : 
                      invitacion.rol === 'vendedor' ? 'Vendedor' : 'Cliente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        invitacion.estado === 'aceptada' ? "success" : 
                        invitacion.estado === 'rechazada' ? "destructive" : 
                        invitacion.estado === 'expirada' || (isPending && isExpired) ? "outline" : 
                        "default"
                      }
                      className="flex w-fit items-center"
                    >
                      {invitacion.estado === 'aceptada' ? (
                        <>
                          <Check className="mr-1 h-3 w-3" /> Aceptada
                        </>
                      ) : invitacion.estado === 'rechazada' ? (
                        <>
                          <X className="mr-1 h-3 w-3" /> Rechazada
                        </>
                      ) : invitacion.estado === 'expirada' || (isPending && isExpired) ? (
                        <>
                          <AlertCircle className="mr-1 h-3 w-3" /> Expirada
                        </>
                      ) : (
                        <>
                          <MailCheck className="mr-1 h-3 w-3" /> Pendiente
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(invitacion.fecha_creacion).toLocaleString()}</TableCell>
                  <TableCell>{new Date(invitacion.fecha_expiracion).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(isPending && !isExpired) && (
                          <DropdownMenuItem 
                            onClick={() => {
                              const inviteUrl = `${window.location.origin}/auth/invitation?token=${invitacion.token}`;
                              navigator.clipboard.writeText(inviteUrl);
                              toast({
                                title: "URL copiada",
                                description: "El enlace de invitación ha sido copiado al portapapeles"
                              });
                            }}
                          >
                            Copiar enlace de invitación
                          </DropdownMenuItem>
                        )}
                        
                        {(isPending && !isExpired) && (
                          <DropdownMenuItem 
                            onClick={() => cancelarInvitacion.mutate(invitacion.id)}
                          >
                            Cancelar invitación
                          </DropdownMenuItem>
                        )}
                        
                        {(invitacion.estado === 'expirada' || (isPending && isExpired)) && (
                          <DropdownMenuItem 
                            onClick={() => reenviarInvitacion.mutate(invitacion.id)}
                          >
                            Reenviar invitación
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (!isAdmin()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            No tienes permisos para gestionar usuarios.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Administra los usuarios que tienen acceso a la plataforma.
          </CardDescription>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Añade un nuevo usuario con acceso directo a la plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Nombre completo"
                    value={newUser.nombre}
                    onChange={handleNewUserChange}
                    className={validationErrors.nombre ? "border-red-500" : ""}
                  />
                  {validationErrors.nombre && (
                    <p className="text-sm text-red-500">{validationErrors.nombre}</p>
                  )}
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newUser.email}
                    onChange={handleNewUserChange}
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                  )}
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Contraseña segura"
                    value={newUser.password}
                    onChange={handleNewUserChange}
                    className={validationErrors.password ? "border-red-500" : ""}
                  />
                  {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                  )}
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select 
                    value={newUser.rol}
                    onValueChange={(value) => handleRoleChange(value, 'user')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewUserDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createNewUser}>
                  Crear Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Usuario</DialogTitle>
                <DialogDescription>
                  Envía una invitación por correo electrónico para unirse a la plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newInvite.email}
                    onChange={handleNewInviteChange}
                    className={validationErrors.inviteEmail ? "border-red-500" : ""}
                  />
                  {validationErrors.inviteEmail && (
                    <p className="text-sm text-red-500">{validationErrors.inviteEmail}</p>
                  )}
                </div>
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select 
                    value={newInvite.rol}
                    onValueChange={(value) => handleRoleChange(value, 'invite')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <div className="flex">
                    <div className="shrink-0">
                      <AlertCircle className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-slate-600">
                        Se generará un token único y se mostrará un enlace que puedes compartir con el usuario.
                        Por el momento, deberás compartir este enlace manualmente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={sendInvitation} disabled={inviteLoading}>
                  {inviteLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Crear Invitación
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="invitaciones">Invitaciones</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {renderTabContent()}
        
        <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transferir Usuario</DialogTitle>
              <DialogDescription>
                Transfiere este usuario a otra empresa manteniendo su historial.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="targetEmpresa">Empresa Destino</Label>
                <Select 
                  value={transferData.targetEmpresaId.toString()}
                  onValueChange={(value) => setTransferData(prev => ({ ...prev, targetEmpresaId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.filter(c => c.id !== empresaId).map(company => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preserveRole"
                  checked={transferData.preserveRole}
                  onChange={(e) => setTransferData(prev => ({ ...prev, preserveRole: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="preserveRole">Mantener rol actual</Label>
              </div>
              
              {!transferData.preserveRole && (
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="newRole">Nuevo Rol</Label>
                  <Select 
                    value={transferData.newRole}
                    onValueChange={(value) => handleRoleChange(value, 'transfer')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="vendedor">Vendedor</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="rounded-md bg-amber-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-800">
                      Esta acción transferirá al usuario a otra empresa, manteniendo un registro de su empresa anterior.
                      El usuario seguirá teniendo acceso a sus datos, pero ahora bajo la nueva empresa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleTransferUser} 
                disabled={transferLoading || transferData.targetEmpresaId === 0}
              >
                {transferLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MoveRight className="mr-2 h-4 w-4" />}
                Transferir Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isTransferHistoryDialogOpen} onOpenChange={setIsTransferHistoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Historial de Transferencias</DialogTitle>
              <DialogDescription>
                Historial de transferencias entre empresas para {selectedUserName}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {transferHistory.length === 0 ? (
                <div className="text-center py-6">
                  <History className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No hay historial de transferencias</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transferHistory.map((record, index) => (
                    <div key={index} className="border rounded-md p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Desde: {getCompanyName(record.empresa_anterior)}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(record.fecha_transferencia).toLocaleString()}
                        </p>
                      </div>
                      <MoveRight className="h-5 w-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsTransferHistoryDialogOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default UserManagementTable;
