
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LogoutButton = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Primero obtenemos la sesión actual para confirmar que existe
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Si no hay sesión, solo redirigimos al usuario
        toast({
          title: "No hay sesión activa",
          description: "Redirigiendo a la página de inicio de sesión",
        });
        navigate('/auth');
        return;
      }
      
      // Si hay sesión, intentamos cerrarla
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error al cerrar sesión:", error);
        toast({
          title: "Error al cerrar sesión",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sesión cerrada",
          description: "Has cerrado sesión correctamente",
        });
        
        // Limpiamos cualquier dato de sesión que pudiera quedar en localStorage
        localStorage.removeItem('supabase.auth.token');
        
        // Redirigir a la página de autenticación
        navigate('/auth');
      }
    } catch (error) {
      console.error("Error inesperado al cerrar sesión:", error);
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al cerrar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenuItem 
      disabled={isLoggingOut}
      onClick={handleLogout}
      className="text-red-500 focus:text-red-500 cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
    </DropdownMenuItem>
  );
};

export default LogoutButton;
