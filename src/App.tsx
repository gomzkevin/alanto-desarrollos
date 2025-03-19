
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RequireAuth from './components/auth/RequireAuth';

// Public pages
import IndexPage from './pages/Index';
import NotFoundPage from './pages/NotFound';

// Auth pages
import AuthIndex from './pages/auth/Index';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ResetPassword from './pages/auth/ResetPassword';
import UpdatePassword from './pages/auth/UpdatePassword';

// Dashboard pages
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardIndex from './pages/dashboard/Index';
import DesarrollosIndex from './pages/dashboard/desarrollos/Index';
import DesarrolloDetail from './pages/dashboard/desarrollos/DesarrolloDetail';
import PrototiposIndex from './pages/dashboard/prototipos/PrototipoDetail';
import PropiedadesIndex from './pages/dashboard/propiedades/Index';
import LeadsIndex from './pages/dashboard/leads/Index';
import CotizacionesIndex from './pages/dashboard/cotizaciones/Index';
import NuevaCotizacion from './pages/dashboard/cotizaciones/NuevaCotizacion';
import ConfiguracionIndex from './pages/dashboard/configuracion/Index';
import ProyeccionesIndex from './pages/dashboard/proyecciones/Index';
import ProfilePage from './pages/dashboard/profile/Index';

import './App.css';
import { Toaster } from './components/ui/toaster';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
  },
});

function App() {
  // Check authentication status on app load
  useEffect(() => {
    // Handle deep linking for auth callbacks
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // redirect to update password page
      window.location.replace('/auth/update-password' + hash);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<IndexPage />} />
            
            {/* Auth routes */}
            <Route path="/auth" element={<AuthIndex />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/update-password" element={<UpdatePassword />} />
            
            {/* Protected dashboard routes */}
            <Route 
              path="/dashboard" 
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardIndex />} />
              <Route path="desarrollos" element={<DesarrollosIndex />} />
              <Route path="desarrollos/:id" element={<DesarrolloDetail />} />
              <Route path="prototipos/:id" element={<PrototiposIndex />} />
              <Route path="propiedades" element={<PropiedadesIndex />} />
              <Route path="leads" element={<LeadsIndex />} />
              <Route path="cotizaciones" element={<CotizacionesIndex />} />
              <Route path="cotizaciones/nueva" element={<NuevaCotizacion />} />
              <Route path="configuracion" element={<ConfiguracionIndex />} />
              <Route path="proyecciones" element={<ProyeccionesIndex />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
