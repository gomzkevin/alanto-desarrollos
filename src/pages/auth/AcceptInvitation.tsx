import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

type InvitationInfo = {
  id: string;
  empresa_id: number;
  email: string;
  rol: string;
  estado: string;
  fecha_expiracion: string;
  es_valida: boolean;
};

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!token) {
      toast({
        title: "Token inválido",
        description: "No se proporcionó un token de invitación válido.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    fetchInvitationInfo();
  }, [token]);

  const fetchInvitationInfo = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_valid_invitation', { p_token: token });

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Invitación no encontrada");
      }

      const invitationData = data[0];
      
      if (!invitationData.es_valida) {
        toast({
          title: "Invitación inválida",
          description: invitationData.estado === 'aceptada' 
            ? "Esta invitación ya ha sido utilizada."
            : "Esta invitación ha expirado o no es válida.",
          variant: "destructive",
        });
        setTimeout(() => navigate('/auth'), 3000);
        return;
      }

      setInvitation(invitationData);
    } catch (error: any) {
      console.error("Error fetching invitation:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo validar la invitación.",
        variant: "destructive",
      });
      setTimeout(() => navigate('/auth'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!nombre.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa tu nombre completo.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    if (!invitation) return;

    try {
      setIsSubmitting(true);

      // Crear cuenta de usuario
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            nombre: nombre,
            empresa_id: invitation.empresa_id,
            user_role: invitation.rol,
            is_company_admin: false,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signUpError) throw signUpError;

      // Marcar invitación como aceptada
      const { error: updateError } = await supabase
        .from('invitaciones_empresa')
        .update({ estado: 'aceptada' })
        .eq('id', invitation.id);

      if (updateError) {
        console.error("Error updating invitation:", updateError);
      }

      toast({
        title: "¡Bienvenido!",
        description: "Tu cuenta ha sido creada exitosamente. Redirigiendo al dashboard...",
      });

      // Esperar un momento y redirigir
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo completar el registro.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600">Validando invitación...</p>
        </div>
      </div>
    );
  }

  if (!invitation || !invitation.es_valida) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invitación Inválida</CardTitle>
            <CardDescription>
              Esta invitación no es válida o ha expirado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              Ir a Inicio de Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/propmeteo-logo.png" alt="PropMeteo" className="h-16 w-auto object-contain" />
          </div>
          <p className="text-slate-600">Completa tu registro</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Has sido invitado</CardTitle>
            <CardDescription>
              Completa tu registro para unirte como <strong>{invitation.rol}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  required
                />
                <PasswordStrengthIndicator password={password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                  required
                />
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/auth" className="text-sm text-indigo-600 hover:text-indigo-800">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AcceptInvitation;