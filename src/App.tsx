import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Pages
import HomePage from '@/pages/HomePage';
import AuthPage from '@/pages/AuthPage';
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
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/leads" element={<LeadsPage />} />
          <Route path="/dashboard/desarrollos" element={<DesarrollosPage />} />
          <Route path="/dashboard/desarrollos/:id" element={<DesarrolloDetailPage />} />
          <Route path="/dashboard/propiedades" element={<PropiedadesPage />} />
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
