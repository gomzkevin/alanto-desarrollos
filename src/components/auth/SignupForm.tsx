
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { signUpWithEmailPassword } from "@/services/authService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!nombreEmpresa.trim()) {
      setError("Debes ingresar el nombre de tu empresa");
      setLoading(false);
      return;
    }
    
    try {
      const result = await signUpWithEmailPassword(
        email, 
        password, 
        undefined, // empresaId (se creará una nueva)
        "admin", // Rol de administrador por defecto
        nombreEmpresa // Nombre de la empresa a crear
      );
      
      if (result.success) {
        toast({
          title: "Registro exitoso",
          description: "Has sido registrado correctamente",
        });
        navigate("/dashboard");
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || "Error desconocido al registrarse");
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      setError("Ocurrió un error inesperado al intentar registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error al registrarse</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="signup-email">Correo electrónico</Label>
          <Input 
            id="signup-email" 
            type="email" 
            placeholder="correo@ejemplo.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Contraseña</Label>
          <Input 
            id="signup-password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            La contraseña debe tener al menos 6 caracteres
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-empresa">Nombre de la empresa</Label>
          <Input 
            id="signup-empresa" 
            type="text" 
            placeholder="Nombre de tu empresa" 
            value={nombreEmpresa}
            onChange={(e) => setNombreEmpresa(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cargando..." : "Registrarse"}
        </Button>
      </CardFooter>
    </form>
  );
}

export default SignupForm;
