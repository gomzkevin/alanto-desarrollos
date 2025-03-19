
import { useEffect, ReactNode } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton, 
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks';
import { supabase } from '@/integrations/supabase/client';
import UserMenu from './UserMenu';
import { Home, Building, FileText, Users, Settings, BarChart2 } from 'lucide-react';

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

  // Navigation items for the sidebar
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Building, label: 'Desarrollos', path: '/dashboard/desarrollos' },
    { icon: FileText, label: 'Cotizaciones', path: '/dashboard/cotizaciones' },
    { icon: Users, label: 'Leads', path: '/dashboard/leads' },
    { icon: BarChart2, label: 'Proyecciones', path: '/dashboard/proyecciones' },
    { icon: Settings, label: 'Configuración', path: '/dashboard/configuracion' },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 w-full">
        <Sidebar>
          <SidebarContent>
            <div className="px-3 py-4">
              <h2 className="text-xl font-bold text-indigo-600 mb-6 px-2">InmobApp</h2>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link to={item.path} className="flex items-center gap-2">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
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
