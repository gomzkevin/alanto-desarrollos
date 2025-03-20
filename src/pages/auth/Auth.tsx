
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isAuthenticated } from "@/lib/supabase";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { supabase } from "@/integrations/supabase/client";

export function Auth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("login");

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setCheckingAuth(true);
        const auth = await isAuthenticated();
        setIsLoggedIn(auth);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    // Also listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      setIsLoggedIn(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // If user is authenticated, redirect to dashboard
  if (isLoggedIn && !checkingAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">Alanto</h1>
          <p className="text-slate-600">Plataforma de gestión de inversiones inmobiliarias</p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
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
              <LoginForm onSuccess={() => console.log("Login exitoso")} />
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
              <SignupForm onSuccess={() => setActiveTab("login")} />
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
