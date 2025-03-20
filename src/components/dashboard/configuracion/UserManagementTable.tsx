
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
  X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { signUpWithEmailPassword } from "@/services/authService";

type User = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_creacion: string;
  empresa_id?: number;
};

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    rol: "vendedor",
    password: "",
  });
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const { isAdmin, userId, empresaId } = useUserRole();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId) return;
      
      try {
        setIsSubscriptionLoading(true);
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, subscription_plans(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error("Error checking subscription:", error);
        }

        setActiveSubscription(data);
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setIsSubscriptionLoading(false);
      }
    };
    
    checkSubscription();
  }, [userId]);

  // Load users from the same empresa as the current user
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        console.log("Fetching users for empresa_id:", empresaId);
        
        let query = supabase
          .from('usuarios')
          .select('*')
          .order('fecha_creacion', { ascending: false });
          
        // If empresaId exists, filter by it
        if (empresaId) {
          query = query.eq('empresa_id', empresaId);
        }
        
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        console.log("Users fetched:", data?.length);
        setUsers(data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUsers();
    }
  }, [userId, empresaId]);

  const validateForm = () => {
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

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleChange = (value: string) => {
    setNewUser((prev) => ({ ...prev, rol: value }));
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
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Check if within subscription limits
    if (activeSubscription?.subscription_plans?.features?.max_vendedores) {
      const vendedorCount = users.filter(u => u.rol === 'vendedor' && u.activo).length;
      const maxVendedores = activeSubscription.subscription_plans.features.max_vendedores;
      
      if (vendedorCount >= maxVendedores && newUser.rol === 'vendedor') {
        toast({
          title: "Límite alcanzado",
          description: `Tu plan actual permite ${maxVendedores} vendedores. Actualiza tu suscripción para añadir más.`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsCreatingUser(true);

      // First, try to register the user using our auth service
      console.log("Creating user with email:", newUser.email);
      const authResult = await signUpWithEmailPassword(newUser.email, newUser.password, empresaId || undefined);

      if (!authResult.success) {
        throw new Error(authResult.error || "No se pudo crear el usuario");
      }

      let authUserId;
      
      if (authResult.user) {
        authUserId = authResult.user.id;
        console.log("User created with auth ID:", authUserId);
      } else if (authResult.autoSignIn) {
        // User was auto-signed in (development)
        const { data } = await supabase.auth.getUser();
        authUserId = data.user?.id;
        console.log("User auto-signed in with ID:", authUserId);
      } else {
        // For development, try to get the user ID by email
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('auth_id')
          .eq('email', newUser.email)
          .maybeSingle();
          
        if (!userError && userData?.auth_id) {
          authUserId = userData.auth_id;
          console.log("Found existing user with email:", authUserId);
        } else {
          console.log("Could not find user ID, but will continue with user creation");
        }
      }
      
      // Then create or update the user record in our usuarios table
      const userData = {
        auth_id: authUserId,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        empresa_id: empresaId,
        activo: true
      };
      
      console.log("Creating user record with data:", userData);
      
      const { error: userError } = await supabase
        .from('usuarios')
        .upsert(userData)
        .select()
        .single();

      if (userError) {
        console.error("Error creating user record:", userError);
        throw userError;
      }

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
        variant: "success",
      });

      // Reset form and close dialog
      setNewUser({
        nombre: "",
        email: "",
        rol: "vendedor",
        password: "",
      });
      setIsNewUserDialogOpen(false);

      // Refresh user list
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (!error) {
        setUsers(data || []);
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear el usuario.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    if (!isAdmin()) {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden modificar usuarios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: !currentStatus })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, activo: !currentStatus } : user
      ));

      toast({
        title: "Usuario actualizado",
        description: `El usuario ha sido ${!currentStatus ? "activado" : "desactivado"} exitosamente.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el usuario.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const canAddMoreUsers = () => {
    if (!activeSubscription?.subscription_plans?.features?.max_vendedores) {
      return true; // Si no hay límite establecido, permitir agregar
    }
    
    const vendedorCount = users.filter(u => u.rol === 'vendedor' && u.activo).length;
    const maxVendedores = activeSubscription.subscription_plans.features.max_vendedores;
    
    return vendedorCount < maxVendedores;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Administra los usuarios que tienen acceso a la plataforma.
            {activeSubscription?.subscription_plans?.features?.max_vendedores && (
              <p className="mt-1">
                Vendedores activos: {users.filter(u => u.rol === 'vendedor' && u.activo).length} / 
                {activeSubscription.subscription_plans.features.max_vendedores}
              </p>
            )}
            {!activeSubscription && !isSubscriptionLoading && (
              <p className="text-red-500 mt-1">
                Necesitas una suscripción activa para gestionar usuarios.
              </p>
            )}
          </CardDescription>
        </div>
        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              disabled={isLoading || (activeSubscription?.subscription_plans?.features?.max_vendedores && !canAddMoreUsers())}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Añade un nuevo usuario con acceso a la plataforma.
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
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewUserDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={createNewUser} 
                disabled={isCreatingUser}
              >
                {isCreatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Usuario"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="ml-2">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <User className="h-10 w-10 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold">No hay usuarios</h3>
            <p className="mt-2 text-sm text-slate-500">
              Aún no se han creado usuarios en el sistema.
            </p>
          </div>
        ) : (
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
                        variant={user.rol === 'admin' ? "default" : "outline"}
                      >
                        {user.rol === 'admin' ? 'Administrador' : 'Vendedor'}
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
                            onClick={() => toggleUserStatus(user.id, user.activo)}
                          >
                            {user.activo ? 'Desactivar' : 'Activar'} Usuario
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UserManagementTable;
