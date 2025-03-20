
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ui/theme-provider';

import HomePage from './pages/Index';
import DashboardPage from './pages/dashboard/Index';
import NotFoundPage from './pages/NotFound';

// Auth Pages
import AuthPage from './pages/auth/Auth';

// Dashboard Pages
import DesarrollosPage from './pages/dashboard/desarrollos/Index';
import DesarrolloDetailPage from './pages/dashboard/desarrollos/DesarrolloDetail';
import PrototipoDetail from './pages/dashboard/prototipos/PrototipoDetail';
import CotizacionesPage from './pages/dashboard/cotizaciones/Index';
import NuevaCotizacionPage from './pages/dashboard/cotizaciones/NuevaCotizacion';
import LeadsPage from './pages/dashboard/leads/Index';
import PropiedadesPage from './pages/dashboard/propiedades/Index';
import ProyeccionesPage from './pages/dashboard/proyecciones/Index';
import ConfiguracionPage from './pages/dashboard/configuracion/Index';

// Nuevas páginas de ventas
import VentasPage from './pages/dashboard/ventas/Index';
import VentaDetail from './pages/dashboard/ventas/VentaDetail';

// Crear un cliente de consulta para React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minuto
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/*" element={<AuthPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/desarrollos" element={<DesarrollosPage />} />
            <Route path="/dashboard/desarrollos/:id" element={<DesarrolloDetailPage />} />
            <Route path="/dashboard/prototipos/:id" element={<PrototipoDetail />} />
            <Route path="/dashboard/cotizaciones" element={<CotizacionesPage />} />
            <Route path="/dashboard/cotizaciones/nueva" element={<NuevaCotizacionPage />} />
            <Route path="/dashboard/leads" element={<LeadsPage />} />
            <Route path="/dashboard/propiedades" element={<PropiedadesPage />} />
            <Route path="/dashboard/proyecciones" element={<ProyeccionesPage />} />
            <Route path="/dashboard/configuracion" element={<ConfiguracionPage />} />
            
            {/* Nuevas rutas de ventas */}
            <Route path="/dashboard/ventas" element={<VentasPage />} />
            <Route path="/dashboard/ventas/:ventaId" element={<VentaDetail />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
