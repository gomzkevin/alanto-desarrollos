
import { useEffect, ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from './UserMenu';

interface DashboardLayoutProps {
  children?: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { role, isLoading } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Redirect to login if user is not authenticated after loading
  useEffect(() => {
    if (!isLoading && !role) {
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión para acceder al dashboard",
        variant: "destructive"
      });
      navigate('/auth/login');
    }
  }, [isLoading, role, navigate, toast]);

  return (
    <main className="min-h-screen">
      <Sidebar>
        <div className="absolute top-4 right-4">
          <UserMenu />
        </div>
      </Sidebar>
      {children || <Outlet />}
    </main>
  );
};

export default DashboardLayout;
