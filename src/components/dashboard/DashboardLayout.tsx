
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, BarChart3, Calculator, Briefcase, 
  Settings, Menu, X, ChevronDown, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import LogoutButton from './LogoutButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attemptedAuth, setAttemptedAuth] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading: userLoading, userId, userEmail, userName, authChecked, isAdmin, empresaId } = useUserRole();
  const { subscriptionInfo, isLoading: subscriptionLoading } = useSubscriptionInfo();
  
  // Verificar suscripción al cargar el dashboard para administradores
  useEffect(() => {
    // Solo ejecutar para administradores con empresa asignada
    if (authChecked && !userLoading && !subscriptionLoading && userId && isAdmin() && empresaId) {
      // Si no tiene suscripción y no está ya en configuración
      if (!subscriptionInfo.isActive && !location.pathname.includes('/dashboard/configuracion')) {
        console.log('Administrador sin suscripción detectado en el layout, redirigiendo a configuración');
        navigate('/dashboard/configuracion', { replace: true });
      }
    }
  }, [authChecked, userLoading, subscriptionLoading, userId, isAdmin, empresaId, subscriptionInfo.isActive, location.pathname, navigate]);
  
  const getUserInitials = () => {
    if (userName) {
      const names = userName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return userName.substring(0, 2).toUpperCase();
    }
    if (userEmail) {
      return userEmail.substring(0, 2).toUpperCase();
    }
    return 'U';
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      if (attemptedAuth) return;
      
      try {
        setAttemptedAuth(true);
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          console.log("No session found, redirecting to auth");
          toast({
            title: "Sesión expirada",
            description: "Por favor inicia sesión para continuar",
          });
          navigate('/auth');
        } else {
          console.log("Session found:", data.session.user.id);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        toast({
          title: "Error de autenticación",
          description: "Hubo un problema al verificar tu sesión",
          variant: "destructive"
        });
      }
    };
    
    checkAuth();
  }, [navigate, attemptedAuth]);
  
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (userLoading || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (!userId && authChecked) {
    console.log("No userId but authChecked, redirecting to auth");
    navigate('/auth');
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: location.pathname === '/dashboard' },
    { name: 'Desarrollos', href: '/dashboard/desarrollos', icon: Building2, current: location.pathname.includes('/dashboard/desarrollos') },
    { name: 'Leads', href: '/dashboard/leads', icon: Users, current: location.pathname.includes('/dashboard/leads') },
    { name: 'Cotizaciones', href: '/dashboard/cotizaciones', icon: Calculator, current: location.pathname.includes('/dashboard/cotizaciones') },
    { name: 'Ventas', href: '/dashboard/ventas', icon: DollarSign, current: location.pathname.includes('/dashboard/ventas') },
    { name: 'Proyecciones', href: '/dashboard/proyecciones', icon: Briefcase, current: location.pathname.includes('/dashboard/proyecciones') },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings, current: location.pathname === '/dashboard/configuracion' },
  ];
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        isSidebarOpen ? "block" : "hidden"
      )}>
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="text-lg font-semibold text-indigo-600">Alanto</div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          
          <nav className="mt-5 px-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  item.current
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    item.current ? "text-indigo-500" : "text-slate-500 group-hover:text-indigo-500"
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="text-lg font-semibold text-indigo-600">Alanto</div>
          </div>
          
          <div className="flex flex-col flex-1 overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    item.current
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      item.current ? "text-indigo-500" : "text-slate-500 group-hover:text-indigo-500"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="bg-white border-b border-slate-200 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded text-slate-500 hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="ml-2 lg:ml-0 text-sm breadcrumbs">
                <ul className="flex items-center space-x-1 text-slate-500">
                  <li>Dashboard</li>
                  <li className="flex items-center space-x-1">
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                    <span>Inicio</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                      <AvatarFallback className="bg-indigo-200 text-indigo-700 font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userName || 'Usuario'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail || 'correo@ejemplo.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/configuracion">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
