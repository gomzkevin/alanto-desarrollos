import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyProfileForm from "@/components/dashboard/configuracion/CompanyProfileForm";
import UserManagementTable from "@/components/dashboard/configuracion/UserManagementTable";
import SubscriptionPlans from "@/components/dashboard/configuracion/SubscriptionPlans";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSubscriptionInfo } from "@/hooks/useSubscriptionInfo";
import SubscriptionRequiredDialog from "@/components/dashboard/configuracion/SubscriptionRequiredDialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<string>("cuenta");
  const { isAdmin, userName, userEmail, isLoading: userLoading, userId, empresaId } = useUserRole();
  const { subscriptionInfo, isLoading: subscriptionLoading } = useSubscriptionInfo();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const tab = params.get('tab');
    
    if (success === 'true') {
      setActiveTab("suscripcion");
      navigate('/dashboard/configuracion', { replace: true });
    } else if (tab) {
      setActiveTab(tab);
    }
  }, [location, navigate]);

  const AccountSettings = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mi Cuenta</CardTitle>
          <CardDescription>
            Gestiona la configuración de tu cuenta personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-md font-medium mb-2">Información Personal</h3>
            <p className="text-sm text-slate-600">Nombre: {userName || "No disponible"}</p>
            <p className="text-sm text-slate-600">Email: {userEmail || "No disponible"}</p>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Cambiar Contraseña</h3>
            <p className="text-sm text-slate-600 mb-4">
              Para cambiar tu contraseña, cierra sesión y usa la opción de recuperación de contraseña.
            </p>
            <Button 
              onClick={() => {
                toast({
                  title: "Próximamente",
                  description: "Esta función estará disponible en futuras actualizaciones.",
                })
              }}
              variant="outline"
            >
              Cambiar Contraseña
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (userLoading || subscriptionLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
            <p className="text-slate-600 mt-1">Cargando configuración...</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const adminStatus = isAdmin();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-1">
            Administra la configuración de tu cuenta y empresa
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="cuenta">Mi Cuenta</TabsTrigger>
            {adminStatus && (
              <>
                <TabsTrigger value="perfil">Perfil de Empresa</TabsTrigger>
                <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                <TabsTrigger value="suscripcion">Suscripción</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="cuenta" className="space-y-6">
            {!subscriptionInfo.isActive && empresaId && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200">
                <AlertTitle className="text-amber-800">
                  Plan Free Activo
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  Tu empresa está usando el plan gratuito. Algunas funcionalidades están limitadas.
                  {adminStatus && " Actualiza tu plan para desbloquear más recursos."}
                </AlertDescription>
              </Alert>
            )}
            <AccountSettings />
          </TabsContent>

          {adminStatus && (
            <>
              <TabsContent value="perfil" className="space-y-6">
                {!subscriptionInfo.isActive && (
                  <Alert variant="warning" className="bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800">
                      Plan Free Activo
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Tu empresa está usando el plan gratuito. Actualiza para acceder a más funcionalidades.
                    </AlertDescription>
                  </Alert>
                )}
                <CompanyProfileForm />
              </TabsContent>

              <TabsContent value="usuarios" className="space-y-6">
                {!subscriptionInfo.isActive && (
                  <Alert variant="warning" className="bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800">
                      Plan Free Activo
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      El plan gratuito permite solo 1 usuario administrador. Actualiza para invitar a tu equipo.
                    </AlertDescription>
                  </Alert>
                )}
                <UserManagementTable />
              </TabsContent>

              <TabsContent value="suscripcion" className="space-y-6">
                {!subscriptionInfo.isActive ? (
                  <SubscriptionRequiredDialog />
                ) : (
                  <SubscriptionPlans />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default ConfiguracionPage;
