
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionCheck from '@/components/dashboard/SubscriptionCheck';

// Pages
import HomePage from '@/pages/Index';
import PlanesPage from '@/pages/Planes';
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Establecer un timeout de seguridad para prevenir carga indefinida
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Safety timeout triggered: resetting loading state");
        setIsLoading(false);
        setIsLoggedIn(false);
      }
    }, 5000); // 5 segundos como máximo para cargar

    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          setIsLoggedIn(false);
          setIsLoading(false);
          return;
        }
        
        setIsLoggedIn(!!data.session);
        setIsLoading(false);
        
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
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    return () => clearTimeout(safetyTimeout);
  }, []);

  // Mostrar un loader mientras se verifica la autenticación
  if (isLoading) {
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
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/planes" element={<PlanesPage />} />
          <Route path="/desarrollo/:id" element={<DesarrolloPreview />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          
          {/* Configuración route no need for SubscriptionCheck */}
          <Route path="/dashboard/configuracion" element={<ConfiguracionPage />} />
          
          {/* All other dashboard routes - Wrapped with SubscriptionCheck */}
          <Route path="/dashboard" element={
            <SubscriptionCheck>
              <DashboardPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/leads" element={
            <SubscriptionCheck>
              <LeadsPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/desarrollos" element={
            <SubscriptionCheck>
              <DesarrollosPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/desarrollos/:id" element={
            <SubscriptionCheck>
              <DesarrolloDetailPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/cotizaciones" element={
            <SubscriptionCheck>
              <CotizacionesPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/cotizaciones/nueva" element={
            <SubscriptionCheck>
              <NuevaCotizacionPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/ventas" element={
            <SubscriptionCheck>
              <VentasPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/ventas/:ventaId" element={
            <SubscriptionCheck>
              <VentaDetail />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/prototipos/:id" element={
            <SubscriptionCheck>
              <PrototipoDetailPage />
            </SubscriptionCheck>
          } />
          <Route path="/dashboard/proyecciones" element={
            <SubscriptionCheck>
              <ProyeccionesPage />
            </SubscriptionCheck>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </Router>
  );
}

export default App;
