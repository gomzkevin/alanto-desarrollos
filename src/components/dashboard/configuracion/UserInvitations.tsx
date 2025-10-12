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
  Mail, 
  Plus, 
  Copy, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { usePermissions } from "@/hooks/usePermissions";

type Invitation = {
  id: string;
  email: string;
  rol: string;
  estado: string;
  token: string;
  fecha_creacion: string;
  fecha_expiracion: string;
};

export function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    rol: "vendedor",
  });
  const { empresaId, userId } = useUserRole();
  const { isWithinVendorLimits } = usePermissions();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInvitations();
  }, [empresaId]);

  const fetchInvitations = async () => {
    if (!empresaId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('invitaciones_empresa')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las invitaciones.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newInvitation.email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(newInvitation.email)) {
      errors.email = "El correo electrónico no es válido";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createInvitation = async () => {
    if (!validateForm()) return;
    
    // Verificar límite de vendedores si el rol es vendedor
    if (newInvitation.rol === 'vendedor' && !isWithinVendorLimits()) {
      return;
    }

    try {
      setIsCreating(true);

      // Verificar si ya existe una invitación pendiente para este email
      const { data: existing } = await supabase
        .from('invitaciones_empresa')
        .select('id')
        .eq('email', newInvitation.email)
        .eq('empresa_id', empresaId)
        .eq('estado', 'pendiente')
        .maybeSingle();

      if (existing) {
        toast({
          title: "Invitación pendiente",
          description: "Ya existe una invitación pendiente para este correo.",
          variant: "destructive",
        });
        return;
      }

      // Generar token
      const { data: tokenData } = await supabase.rpc('generate_invitation_token');
      
      if (!tokenData) {
        throw new Error("No se pudo generar el token de invitación");
      }

      // Crear invitación
      const { error } = await supabase
        .from('invitaciones_empresa')
        .insert({
          empresa_id: empresaId,
          email: newInvitation.email,
          rol: newInvitation.rol,
          token: tokenData,
          creado_por: userId,
          estado: 'pendiente',
          fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      // TODO: Llamar edge function para enviar email
      // await supabase.functions.invoke('send-invitation-email', {
      //   body: { email: newInvitation.email, token: tokenData }
      // });

      toast({
        title: "Invitación creada",
        description: `Se ha creado la invitación para ${newInvitation.email}. Copia el link y envíalo manualmente.`,
      });

      setNewInvitation({ email: "", rol: "vendedor" });
      setIsDialogOpen(false);
      fetchInvitations();
    } catch (error: any) {
      console.error("Error creating invitation:", error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la invitación.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/auth/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado",
      description: "El link de invitación ha sido copiado al portapapeles.",
    });
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invitaciones_empresa')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Invitación eliminada",
        description: "La invitación ha sido eliminada exitosamente.",
      });

      fetchInvitations();
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la invitación.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (estado: string, fechaExpiracion: string) => {
    const isExpired = new Date(fechaExpiracion) < new Date();
    
    if (estado === 'aceptada') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Aceptada</Badge>;
    } else if (estado === 'rechazada') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazada</Badge>;
    } else if (isExpired) {
      return <Badge variant="outline" className="text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Expirada</Badge>;
    } else {
      return <Badge variant="outline" className="text-amber-600 border-amber-600"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Invitaciones de Usuario</CardTitle>
          <CardDescription>
            Invita a nuevos usuarios a unirse a tu empresa
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Invitar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Invitación</DialogTitle>
              <DialogDescription>
                Invita a un nuevo usuario a unirse a tu empresa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={newInvitation.email}
                  onChange={(e) => {
                    setNewInvitation({ ...newInvitation, email: e.target.value });
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: "" });
                    }
                  }}
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="rol">Rol</Label>
                <Select 
                  value={newInvitation.rol}
                  onValueChange={(value) => setNewInvitation({ ...newInvitation, rol: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={createInvitation}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Crear Invitación
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay invitaciones. Crea una para invitar usuarios.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell className="capitalize">{invitation.rol}</TableCell>
                  <TableCell>
                    {getStatusBadge(invitation.estado, invitation.fecha_expiracion)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(invitation.fecha_creacion).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {invitation.estado === 'pendiente' && new Date(invitation.fecha_expiracion) > new Date() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.token)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar Link
                      </Button>
                    )}
                    {invitation.estado === 'pendiente' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInvitation(invitation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default UserInvitations;