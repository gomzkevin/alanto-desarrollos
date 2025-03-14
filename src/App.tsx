
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/propiedades" element={<PropertiesPage />} />
          <Route path="/dashboard/desarrollos" element={<DesarrollosPage />} />
          <Route path="/dashboard/desarrollos/:id" element={<DesarrolloDetailPage />} />
          <Route path="/dashboard/proyecciones" element={<ProyeccionesPage />} />
          <Route path="/dashboard/leads" element={<LeadsPage />} />
          <Route path="/dashboard/cotizaciones" element={<CotizacionesPage />} />
          <Route path="/dashboard/configuracion" element={<ConfiguracionPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
