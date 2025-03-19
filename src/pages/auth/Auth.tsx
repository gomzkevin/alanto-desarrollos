
import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { isAuthenticated } from "@/lib/supabase";

export function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setIsLoggedIn(auth);
    };
    checkAuth();
  }, []);

  // Si el usuario está autenticado, redirigir al dashboard
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  // Función para asegurarse de que el usuario exista en la tabla usuarios
  const ensureUserInDatabase = async (userId: string, userEmail: string) => {
    try {
      console.log('Verificando si el usuario existe en la tabla usuarios:', userId);
      
      // Primero verificamos si el usuario ya existe en la tabla
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email')
        .eq('auth_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No se encontró el usuario
          console.log('Usuario no encontrado en tabla usuarios, creándolo ahora:', userEmail);
          
          // Extraer nombre del email
          const nombre = userEmail.split('@')[0] || 'Usuario';
          
          const { data: insertData, error: insertError } = await supabase
            .from('usuarios')
            .insert({
              auth_id: userId,
              email: userEmail,
              nombre: nombre,
              rol: 'admin', // Default para desarrollo
            })
            .select();
          
          if (insertError) {
            console.error('Error al crear registro de usuario:', insertError);
            return false;
          }
          
          console.log('Usuario creado exitosamente en tabla usuarios:', insertData);
          return true;
        }
        
        console.error('Error al verificar usuario en la tabla:', error);
        return false;
      }
      
      console.log('Usuario ya existe en tabla usuarios:', data);
      return true;
    } catch (error) {
      console.error('Error en ensureUserInDatabase:', error);
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Intentar iniciar sesión directamente con email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Si el error es "Email not confirmed", intentamos manejar este caso
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Correo no confirmado",
            description: "Estamos en modo desarrollo, intentando iniciar sesión de todos modos...",
          });
          
          // En desarrollo, intentamos actualizar el usuario para confirmar su email automáticamente
          try {
            // Primero necesitamos obtener el usuario por email
            const { data: userData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
            });
            
            if (!signUpError && userData) {
              // Intentar iniciar sesión nuevamente
              const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              if (!loginError && loginData.user) {
                // Asegurar que el usuario existe en la tabla usuarios
                await ensureUserInDatabase(loginData.user.id, loginData.user.email || email);
                
                toast({
                  title: "Inicio de sesión exitoso",
                  description: "Has iniciado sesión correctamente en modo desarrollo",
                });
                navigate("/dashboard");
                return;
              }
            }
          } catch (confirmError) {
            console.error("Error al intentar confirmar email:", confirmError);
          }
        }
        
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        // Asegurar que el usuario existe en la tabla usuarios
        await ensureUserInDatabase(data.user.id, data.user.email || email);
        
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido de nuevo",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      toast({
        title: "Error al iniciar sesión",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Para desarrollo, usar signInWithPassword para permitir iniciar sesión inmediatamente después del registro
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/auth",
          // En desarrollo, podríamos querer no requerir verificación de correo
          data: {
            confirmed_at: new Date().toISOString(), // Esto no funcionará directamente, es solo para ilustrar
          }
        }
      });

      if (error) {
        toast({
          title: "Error al registrarse",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // En modo desarrollo, intentar iniciar sesión inmediatamente después del registro
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!signInError && signInData.user) {
            // Asegurar que el usuario existe en la tabla usuarios
            await ensureUserInDatabase(signInData.user.id, signInData.user.email || email);
            
            toast({
              title: "Registro e inicio de sesión exitosos",
              description: "Has sido registrado e iniciado sesión automáticamente (modo desarrollo)",
            });
            navigate("/dashboard");
            return;
          }
        } catch (signInError) {
          console.error("Error al intentar iniciar sesión después del registro:", signInError);
        }
        
        toast({
          title: "Registro exitoso",
          description: "Por favor, revisa tu correo electrónico para confirmar tu cuenta",
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">AirbnbInvest</h1>
          <p className="text-slate-600">Plataforma de gestión de inversiones inmobiliarias</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder a tu cuenta
                </CardDescription>
              </CardHeader>
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
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Crear cuenta</CardTitle>
                <CardDescription>
                  Regístrate para acceder a la plataforma
                </CardDescription>
              </CardHeader>
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
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm">
            Regresar a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Auth;
