
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RequireAuthProps {
  children: JSX.Element;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('User is authenticated:', session.user.email);
          setAuthenticated(true);
        } else {
          console.log('No session found');
          setAuthenticated(false);
          toast({
            title: "Sesión expirada",
            description: "Por favor inicia sesión para continuar",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthenticated(false);
        toast({
          title: "Error de autenticación",
          description: "Hubo un problema al verificar tu sesión",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed, event:', _event);
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login page but remember where they were trying to go
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  console.log('User is authenticated, rendering children');
  return children;
};

export default RequireAuth;
