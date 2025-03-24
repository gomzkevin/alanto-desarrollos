
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';
import RequireAuth from './components/auth/RequireAuth';
import RequireSubscription from './components/auth/RequireSubscription';

// Pages
import HomePage from '@/pages/Index';
import AuthPage from '@/pages/auth/Auth';
import DashboardPage from '@/pages/dashboard/Index';
import LeadsPage from '@/pages/dashboard/leads/Index';
import DesarrollosPage from '@/pages/dashboard/desarrollos/Index';
import DesarrolloDetailPage from '@/pages/dashboard/desarrollos/DesarrolloDetail';
import PropiedadesPage from '@/pages/dashboard/propiedades/Index';
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
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          } />
          
          {/* Leads - Protected by subscription */}
          <Route path="/dashboard/leads" element={
            <RequireAuth>
              <RequireSubscription moduleName="Leads" redirectTo="/dashboard/configuracion">
                <LeadsPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          {/* Desarrollos - Protected by subscription */}
          <Route path="/dashboard/desarrollos" element={
            <RequireAuth>
              <RequireSubscription moduleName="Desarrollos" redirectTo="/dashboard/configuracion">
                <DesarrollosPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          <Route path="/dashboard/desarrollos/:id" element={
            <RequireAuth>
              <RequireSubscription moduleName="Desarrollos" redirectTo="/dashboard/configuracion">
                <DesarrolloDetailPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          {/* Propiedades - Protected by subscription */}
          <Route path="/dashboard/propiedades" element={
            <RequireAuth>
              <RequireSubscription moduleName="Propiedades" redirectTo="/dashboard/configuracion">
                <PropiedadesPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          {/* Cotizaciones - Protected by subscription */}
          <Route path="/dashboard/cotizaciones" element={
            <RequireAuth>
              <RequireSubscription moduleName="Cotizaciones" redirectTo="/dashboard/configuracion">
                <CotizacionesPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          <Route path="/dashboard/cotizaciones/nueva" element={
            <RequireAuth>
              <RequireSubscription moduleName="Cotizaciones" redirectTo="/dashboard/configuracion">
                <NuevaCotizacionPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          {/* Ventas - Protected by subscription */}
          <Route path="/dashboard/ventas" element={
            <RequireAuth>
              <RequireSubscription moduleName="Ventas" redirectTo="/dashboard/configuracion">
                <VentasPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          <Route path="/dashboard/ventas/:ventaId" element={
            <RequireAuth>
              <RequireSubscription moduleName="Ventas" redirectTo="/dashboard/configuracion">
                <VentaDetail />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          {/* Prototipos - Protected by subscription */}
          <Route path="/dashboard/prototipos/:id" element={
            <RequireAuth>
              <RequireSubscription moduleName="Prototipos" redirectTo="/dashboard/configuracion">
                <PrototipoDetailPage />
              </RequireSubscription>
            </RequireAuth>
          } />
          
          {/* Configuración - Always accessible */}
          <Route path="/dashboard/configuracion" element={
            <RequireAuth>
              <ConfiguracionPage />
            </RequireAuth>
          } />
          
          {/* Proyecciones - Protected by subscription */}
          <Route path="/dashboard/proyecciones" element={
            <RequireAuth>
              <RequireSubscription moduleName="Proyecciones" redirectTo="/dashboard/configuracion">
                <ProyeccionesPage />
              </RequireSubscription>
            </RequireAuth>
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
