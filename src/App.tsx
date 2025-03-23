import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Dashboard from './pages/dashboard/Dashboard';
import DesarrollosPage from './pages/dashboard/desarrollos/Index';
import DesarrolloDetailsPage from './pages/dashboard/desarrollos/[id]';
import LeadsPage from './pages/dashboard/leads/Index';
import NuevaCotizacion from './pages/dashboard/cotizaciones/NuevaCotizacion';
import CotizacionesPage from './pages/dashboard/cotizaciones/Index';
import SignIn from './pages/auth/SignIn';
import RequireAuth from './components/auth/RequireAuth';
import UnidadesPage from './pages/dashboard/unidades/Index';
import NuevaUnidad from './pages/dashboard/unidades/NuevaUnidad';
import EditUnidad from './pages/dashboard/unidades/EditUnidad';
import UsersPage from './pages/dashboard/users/Index';
import NewUser from './pages/dashboard/users/NewUser';
import EditUser from './pages/dashboard/users/EditUser';
import Subscription from './pages/dashboard/subscription/Index';

// Crear una instancia del cliente de consulta
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <Router>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            
            <Route path="/dashboard/desarrollos" element={<RequireAuth><DesarrollosPage /></RequireAuth>} />
            <Route path="/dashboard/desarrollos/:id" element={<RequireAuth><DesarrolloDetailsPage /></RequireAuth>} />
            
            <Route path="/dashboard/leads" element={<RequireAuth><LeadsPage /></RequireAuth>} />
            
            <Route path="/dashboard/cotizaciones" element={<RequireAuth><CotizacionesPage /></RequireAuth>} />
            <Route path="/dashboard/cotizaciones/nueva" element={<RequireAuth><NuevaCotizacion /></RequireAuth>} />

            <Route path="/dashboard/unidades" element={<RequireAuth><UnidadesPage /></RequireAuth>} />
            <Route path="/dashboard/unidades/nueva" element={<RequireAuth><NuevaUnidad /></RequireAuth>} />
            <Route path="/dashboard/unidades/editar/:id" element={<RequireAuth><EditUnidad /></RequireAuth>} />

            <Route path="/dashboard/users" element={<RequireAuth><UsersPage /></RequireAuth>} />
            <Route path="/dashboard/users/nuevo" element={<RequireAuth><NewUser /></RequireAuth>} />
            <Route path="/dashboard/users/editar/:id" element={<RequireAuth><EditUser /></RequireAuth>} />

            <Route path="/dashboard/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;
