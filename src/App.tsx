
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';

// Pages
import HomePage from '@/pages/Index';
import DesarrolloPreview from '@/pages/DesarrolloPreview';
import AuthPage from '@/pages/auth/Auth';
import DashboardPage from '@/pages/dashboard/Index';
import LeadsPage from '@/pages/dashboard/leads/Index';
import DesarrollosPage from '@/pages/dashboard/desarrollos/Index';
import DesarrolloDetailPage from '@/pages/dashboard/desarrollos/DesarrolloDetail';
// import PropiedadesPage from '@/pages/dashboard/propiedades/Index'; // Commented out for now
import CotizacionesPage from '@/pages/dashboard/cotizaciones/Index';
import NuevaCotizacionPage from '@/pages/dashboard/cotizaciones/NuevaCotizacion';
import VentasPage from '@/pages/dashboard/ventas/Index';
import VentaDetail from '@/pages/dashboard/ventas/VentaDetail';
import PrototipoDetailPage from '@/pages/dashboard/prototipos/PrototipoDetail';
import ConfiguracionPage from '@/pages/dashboard/configuracion/Index';
import ProyeccionesPage from '@/pages/dashboard/proyecciones/Index';
import NotFoundPage from '@/pages/NotFound';

// Configurar el cliente QueryClient con manejo de errores mejorado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          setIsLoggedIn(false);
          return;
        }
        
        setIsLoggedIn(!!data.session);
        
        // Suscribirse a cambios de autenticación
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state changed:", event);
            setIsLoggedIn(!!session);
          }
        );
        
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Unexpected error checking auth:", err);
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
  }, []);

  // Mostrar un loader mientras se verifica la autenticación
  if (isLoggedIn === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/desarrollo/:id" element={<DesarrolloPreview />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/leads" element={<LeadsPage />} />
          <Route path="/dashboard/desarrollos" element={<DesarrollosPage />} />
          <Route path="/dashboard/desarrollos/:id" element={<DesarrolloDetailPage />} />
          {/* Propiedades route commented out */}
          {/* <Route path="/dashboard/propiedades" element={<PropiedadesPage />} /> */}
          <Route path="/dashboard/cotizaciones" element={<CotizacionesPage />} />
          <Route path="/dashboard/cotizaciones/nueva" element={<NuevaCotizacionPage />} />
          <Route path="/dashboard/ventas" element={<VentasPage />} />
          <Route path="/dashboard/ventas/:ventaId" element={<VentaDetail />} />
          <Route path="/dashboard/prototipos/:id" element={<PrototipoDetailPage />} />
          <Route path="/dashboard/configuracion" element={<ConfiguracionPage />} />
          <Route path="/dashboard/proyecciones" element={<ProyeccionesPage />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
