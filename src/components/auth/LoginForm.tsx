
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { signInWithEmailPassword } from "@/services/authService";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signInWithEmailPassword(email, password);
      
      if (result.success) {
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo",
        });
        
        // After successful login, redirect to dashboard
        navigate("/dashboard");
        if (onSuccess) onSuccess();
      } else {
        // Personalizar mensaje de error para hacerlo más amigable
        let errorMessage = result.error;
        if (errorMessage?.includes("Email not confirmed") || errorMessage?.includes("Correo no confirmado")) {
          errorMessage = "Su correo electrónico no ha sido confirmado. Por favor revise su bandeja de entrada.";
        } else if (errorMessage?.includes("Invalid login credentials")) {
          errorMessage = "Credenciales incorrectas. Verifique su correo y contraseña.";
        }
        
        toast({
          title: "Error al iniciar sesión",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      toast({
        title: "Error al iniciar sesión",
        description: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="correo@ejemplo.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </Button>
      </CardFooter>
    </form>
  );
}

export default LoginForm;
