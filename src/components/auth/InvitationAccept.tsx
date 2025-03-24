import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInvitaciones, InvitationVerificationResult } from "@/hooks/useInvitaciones";
import { toast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, AlertCircle, UserPlus } from "lucide-react";

export function InvitationAccept() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { verificarInvitacion, aceptarInvitacion, loading } = useInvitaciones();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationVerificationResult | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkInvitation = async () => {
      if (!token) {
        toast({
          title: "Token no válido",
          description: "El enlace de invitación no es válido",
          variant: "destructive",
        });
        return;
      }

      try {
        const invitation = await verificarInvitacion(token);
        setInvitationData(invitation);
        setIsValid(invitation && invitation.es_valida);
      } catch (error) {
        console.error("Error verificando invitación:", error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkInvitation();
  }, [token, verificarInvitacion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!token) {
      toast({
        title: "Error",
        description: "No se ha proporcionado un token de invitación",
        variant: "destructive",
      });
      return;
    }
    
    const result = await aceptarInvitacion(token, formData.nombre, formData.password);
    
    if (result.success) {
      toast({
        title: "Bienvenido",
        description: "Te has unido a la empresa con éxito. Ahora puedes iniciar sesión.",
      });
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verificando invitación</CardTitle>
            <CardDescription>
              Comprobando la validez de tu invitación...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || !invitationData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Invitación no válida</CardTitle>
            <CardDescription>
              Lo sentimos, la invitación no es válida o ha expirado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-center text-sm text-gray-500 mt-4">
              Contacta con el administrador de tu empresa para obtener una nueva invitación.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => navigate("/auth")}
            >
              Volver al inicio de sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Aceptar Invitación</CardTitle>
          <CardDescription>
            Has sido invitado a unirte a la plataforma como{" "}
            <Badge variant="outline">
              {invitationData.rol === 'admin' ? 'Administrador' : 
               invitationData.rol === 'vendedor' ? 'Vendedor' : 'Cliente'}
            </Badge>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center py-2 mb-4">
              <UserPlus className="h-12 w-12 text-primary mb-2" />
              <p className="text-sm text-center text-gray-600">
                La invitación fue enviada a <span className="font-semibold">{invitationData.email}</span>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Crea una contraseña segura"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Aceptar invitación"
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              type="button"
              onClick={() => navigate("/auth")}
            >
              Volver al inicio de sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default InvitationAccept;
