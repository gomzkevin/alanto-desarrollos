
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { signUpWithEmailPassword } from "@/services/authService";

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signUpWithEmailPassword(email, password);
      
      if (result.success) {
        if (result.autoSignIn) {
          toast({
            title: "Registro e inicio de sesión exitosos",
            description: "Has sido registrado e iniciado sesión automáticamente (modo desarrollo)",
          });
          navigate("/dashboard");
          if (onSuccess) onSuccess();
        } else {
          toast({
            title: "Registro exitoso",
            description: "Por favor, revisa tu correo electrónico para confirmar tu cuenta",
          });
        }
      } else {
        toast({
          title: "Error al registrarse",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en registro:", error);
      toast({
        title: "Error al registrarse",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <CardContent className="space-y-4">
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
