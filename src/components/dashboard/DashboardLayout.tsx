import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  Calculator,
  ClipboardCheck,
  Users,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { userRole, isAdmin } = useUserRole();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Verificar si la ruta actual está activa
  const isActive = useCallback(
    (path: string) => {
      return location.pathname.startsWith(path);
    },
    [location]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`}
      >
        <div className="flex h-16 items-center border-b px-4">
          <h1 className="text-xl font-bold">InmoDash</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute right-2 top-3 md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-1">
          <Button
            asChild
            variant={isActive('/dashboard') && !isActive('/dashboard/') ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant={isActive('/dashboard/desarrollos') ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Link to="/dashboard/desarrollos">
              <Building className="mr-2 h-4 w-4" />
              Desarrollos
            </Link>
          </Button>
          <Button
            asChild
            variant={isActive('/dashboard/ventas') ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Link to="/dashboard/ventas">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Seguimiento de Ventas
            </Link>
          </Button>
          <Button
            asChild
            variant={isActive('/dashboard/cotizaciones') ? 'secondary' : 'ghost'}
            className="w-full justify-start"
          >
            <Link to="/dashboard/cotizaciones">
              <Calculator className="mr-2 h-4 w-4" />
              Cotizaciones
            </Link>
          </Button>
          {(isAdmin() || userRole === 'admin') && (
            <>
              <Button
                asChild
                variant={isActive('/dashboard/leads') ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <Link to="/dashboard/leads">
                  <Users className="mr-2 h-4 w-4" />
                  Leads
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive('/dashboard/propiedades') ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <Link to="/dashboard/propiedades">
                  <Building className="mr-2 h-4 w-4" />
                  Propiedades
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive('/dashboard/proyecciones') ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <Link to="/dashboard/proyecciones">
                  <Calculator className="mr-2 h-4 w-4" />
                  Proyecciones
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive('/dashboard/configuracion') ? 'secondary' : 'ghost'}
                className="w-full justify-start"
              >
                <Link to="/dashboard/configuracion">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 border-b px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <LayoutDashboard className="h-5 w-5" />
          </Button>
          {/* Puedes agregar aquí componentes para el header, como información del usuario */}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
