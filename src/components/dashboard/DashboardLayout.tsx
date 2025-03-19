
import { useEffect, ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarProvider, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
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
      try {
        console.log('Checking dashboard auth...');
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          console.log('No session found in dashboard, redirecting to login');
          navigate('/auth/login');
        } else {
          console.log('Dashboard session found:', data.session.user.email);
        }
      } catch (error) {
        console.error('Error checking auth in dashboard:', error);
        toast({
          title: "Error de autenticación",
          description: "Hubo un problema al verificar tu sesión",
          variant: "destructive"
        });
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Redirect to login if user is not authenticated after loading
  useEffect(() => {
    if (!isLoading && !role) {
      console.log('No role found after loading, redirecting to login');
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión para acceder al dashboard",
        variant: "destructive"
      });
      navigate('/auth/login');
    }
  }, [isLoading, role, navigate, toast]);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 w-full">
        <Sidebar>
          <SidebarContent>
            {/* Sidebar navigation content goes here */}
          </SidebarContent>
          <SidebarFooter className="p-4">
            <UserMenu />
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto pl-16 md:pl-64 p-6">
          {children || <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
