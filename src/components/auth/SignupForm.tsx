
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { signUpWithEmailPassword } from "@/services/authService";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Iniciando proceso de registro...');
      
      // Registrar usuario como admin con nombre de empresa en metadatos
      // El trigger handle_new_user se encargará de crear la empresa automáticamente
      const result = await signUpWithEmailPassword(
        email, 
        password, 
        undefined, // empresa_id será generado por el trigger
        "admin",
        true, // autoSignIn
        companyName // Pasar nombre de empresa
      );
      
      if (result.success) {
        if (result.user || result.autoSignIn) {
          toast({
            title: "Registro e inicio de sesión exitosos",
            description: result.message || "Has sido registrado e iniciado sesión automáticamente como administrador de tu empresa",
          });
          navigate("/dashboard");
          if (onSuccess) onSuccess();
        } else {
          toast({
            title: "Registro exitoso",
            description: result.message || "Por favor, revisa tu correo electrónico para confirmar tu cuenta",
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
          <Label htmlFor="company-name">Nombre de la Empresa</Label>
          <Input 
            id="company-name" 
            type="text" 
            placeholder="Nombre de tu empresa" 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        
        <Separator className="my-4" />
        
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
          <PasswordStrengthIndicator password={password} />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse como Administrador"}
        </Button>
      </CardFooter>
    </form>
  );
}

export default SignupForm;
