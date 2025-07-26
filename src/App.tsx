
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CompanyProvider } from '@/contexts/CompanyContext';
import { useProtectedRoute } from '@/hooks/optimized/useProtectedRoute';

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
import SecurityPage from '@/pages/dashboard/security/Index';
import NotFoundPage from '@/pages/NotFound';

// Configurar el cliente QueryClient optimizado
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireSubscription?: boolean }> = ({ 
  children, 
  requireSubscription = true 
}) => {
  const { hasAccess, isLoading } = useProtectedRoute({ requireSubscription });
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }
  
  return hasAccess ? <>{children}</> : null;
};

function App() {

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CompanyProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/desarrollo/:id" element={<DesarrolloPreview />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              
              {/* Configuración route - no subscription required */}
              <Route path="/dashboard/configuracion" element={
                <ProtectedRoute requireSubscription={false}>
                  <ConfiguracionPage />
                </ProtectedRoute>
              } />
              
              {/* Security route - admin only */}
              <Route path="/dashboard/security" element={
                <ProtectedRoute requireSubscription={false}>
                  <SecurityPage />
                </ProtectedRoute>
              } />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/leads" element={
                <ProtectedRoute>
                  <LeadsPage />
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
              <Route path="/dashboard/prototipos/:id" element={
                <ProtectedRoute>
                  <PrototipoDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/proyecciones" element={
                <ProtectedRoute>
                  <ProyeccionesPage />
                </ProtectedRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
          </CompanyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
