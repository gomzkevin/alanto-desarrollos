
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, Users, BarChart3, Calculator, Briefcase, 
  Settings, LogOut, Menu, X, ChevronDown, Home
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
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, isLoading } = useUserRole();
  const { toast } = useToast();
  
  // Cerrar el sidebar en versión móvil cuando cambia la ruta
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, current: location.pathname === '/dashboard' },
    { name: 'Desarrollos', href: '/dashboard/desarrollos', icon: Building2, current: location.pathname.includes('/dashboard/desarrollos') },
    { name: 'Propiedades', href: '/dashboard/propiedades', icon: Home, current: location.pathname === '/dashboard/propiedades' },
    { name: 'Leads', href: '/dashboard/leads', icon: Users, current: location.pathname.includes('/dashboard/leads') },
    { name: 'Cotizaciones', href: '/dashboard/cotizaciones', icon: Calculator, current: location.pathname.includes('/dashboard/cotizaciones') },
    { name: 'Proyecciones', href: '/dashboard/proyecciones', icon: Briefcase, current: location.pathname.includes('/dashboard/proyecciones') },
    { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings, current: location.pathname === '/dashboard/configuracion' },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      });
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión correctamente',
        variant: 'destructive',
      });
    }
  };

  // Get initials from user name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar para móvil */}
      <div className={cn(
        "fixed inset-0 z-40 lg:hidden",
        isSidebarOpen ? "block" : "hidden"
      )}>
        {/* Overlay de fondo oscuro */}
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        
        {/* Sidebar sliding panel */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="text-lg font-semibold text-indigo-600">
              {userData?.empresaNombre || 'AirbnbInvest'}
            </div>
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
      
      {/* Sidebar para escritorio */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="text-lg font-semibold text-indigo-600">
              {userData?.empresaNombre || 'AirbnbInvest'}
            </div>
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
      
      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar superior */}
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
                    <div className="h-8 w-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold">
                      {userData ? getInitials(userData.name) : 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userData?.name || 'Usuario'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userData?.email || 'correo@ejemplo.com'}
                      </p>
                      {userData?.empresaNombre && (
                        <p className="text-xs font-medium text-indigo-600">
                          {userData.empresaNombre}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard/configuracion')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        {/* Área de contenido */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
