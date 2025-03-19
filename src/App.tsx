
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
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          } />
          <Route path="/dashboard/propiedades" element={
            <RequireAuth>
              <PropertiesPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/desarrollos" element={
            <RequireAuth>
              <DesarrollosPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/desarrollos/:id" element={
            <RequireAuth>
              <DesarrolloDetailPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/proyecciones" element={
            <RequireAuth>
              <ProyeccionesPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/leads" element={
            <RequireAuth>
              <LeadsPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/cotizaciones" element={
            <RequireAuth>
              <CotizacionesPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/cotizaciones/nueva" element={
            <RequireAuth>
              <NuevaCotizacionPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/configuracion" element={
            <RequireAuth>
              <ConfiguracionPage />
            </RequireAuth>
          } />
          <Route path="/dashboard/prototipos/:id" element={
            <RequireAuth>
              <PrototipoDetail />
            </RequireAuth>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
