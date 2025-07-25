import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { signInWithEmailPassword } from "@/services/authService";
import { Link } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    
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
        // Display the secure error message from the auth service
        setErrorMessage(result.error || "Error al iniciar sesión");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      setErrorMessage("Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error al iniciar sesión</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="correo@ejemplo.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            minLength={5}
            maxLength={254}
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
            minLength={8}
            maxLength={128}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Procesando..." : "Iniciar Sesión"}
        </Button>
        <div className="text-sm text-center mt-2">
          <Link to="/" className="text-primary hover:text-primary/80">
            ¿Olvidó su contraseña?
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}

export default LoginForm;