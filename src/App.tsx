
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard/Index";
import PropertiesPage from "./pages/dashboard/propiedades/Index";
import { ProyeccionesPage } from "./pages/dashboard/proyecciones/Index";
import NotFound from "./pages/NotFound";
import DesarrollosPage from "./pages/dashboard/desarrollos/Index";
import DesarrolloDetailPage from "./pages/dashboard/desarrollos/DesarrolloDetail";
import ConfiguracionPage from "./pages/dashboard/configuracion/Index";
import LeadsPage from "./pages/dashboard/leads/Index";
import CotizacionesPage from "./pages/dashboard/cotizaciones/Index";
import NuevaCotizacionPage from "./pages/dashboard/cotizaciones/NuevaCotizacion";
import PrototipoDetail from "./pages/dashboard/prototipos/PrototipoDetail";
import VentasPage from "./pages/dashboard/ventas/Index";
import VentaDetail from "./pages/dashboard/ventas/VentaDetail";
import Auth from "./pages/auth/Auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar sesión al cargar
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkSession();
    
    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Componente para proteger rutas
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated === null) {
      // Aún cargando estado de autenticación
      return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }
    
    if (!isAuthenticated) {
      // Redireccionar si no está autenticado
      return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/propiedades" element={
              <ProtectedRoute>
                <PropertiesPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/desarrollos" element={
              <ProtectedRoute>
                <DesarrollosPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/desarrollos/:id" element={
              <ProtectedRoute>
                <DesarrolloDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/proyecciones" element={
              <ProtectedRoute>
                <ProyeccionesPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/leads" element={
              <ProtectedRoute>
                <LeadsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/cotizaciones" element={
              <ProtectedRoute>
                <CotizacionesPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/cotizaciones/nueva" element={
              <ProtectedRoute>
                <NuevaCotizacionPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/configuracion" element={
              <ProtectedRoute>
                <ConfiguracionPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/prototipos/:id" element={
              <ProtectedRoute>
                <PrototipoDetail />
              </ProtectedRoute>
            } />
            {/* Nuevas rutas de ventas */}
            <Route path="/dashboard/ventas" element={
              <ProtectedRoute>
                <VentasPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ventas/:ventaId" element={
              <ProtectedRoute>
                <VentaDetail />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
