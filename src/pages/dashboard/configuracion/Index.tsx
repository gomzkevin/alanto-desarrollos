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
  const [activeTab, setActiveTab] = useState<string>("perfil");
  const { isAdmin, userName, userEmail, isLoading: userLoading, userId, empresaId } = useUserRole();
  const { subscriptionInfo, isLoading: subscriptionLoading } = useSubscriptionInfo();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    
    if (success === 'true') {
      setActiveTab("suscripcion");
      navigate('/dashboard/configuracion', { replace: true });
    }
  }, [location, navigate]);

  console.log("ConfiguracionPage - userId:", userId);
  console.log("ConfiguracionPage - Admin status:", isAdmin());
  console.log("ConfiguracionPage - userLoading:", userLoading);
  console.log("ConfiguracionPage - subscriptionInfo:", subscriptionInfo);

  useEffect(() => {
    if (!userLoading && !subscriptionLoading && userId && empresaId) {
      if (!subscriptionInfo.isActive) {
        console.log("Empresa sin suscripción activa, cambiando a tab de suscripción");
        setActiveTab("suscripcion");
      }
    }
  }, [userLoading, subscriptionLoading, userId, empresaId, subscriptionInfo.isActive]);

  useEffect(() => {
    console.log("Setting default tab based on admin status:", isAdmin());
    if (!isAdmin()) {
      setActiveTab("cuenta");
    }
  }, [isAdmin]);

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
  console.log("Rendering configuration with admin status:", adminStatus);

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
                  {isAdmin() && " Actualiza tu plan para desbloquear más recursos."}
                </AlertDescription>
              </Alert>
            )}
            <AccountSettings />
          </TabsContent>
                {!subscriptionInfo.isActive && (
                  <Alert variant="warning" className="bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800">
                      Se requiere una suscripción
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Para poder acceder a todas las funcionalidades, su empresa necesita una suscripción activa.
                      Por favor, vaya a la pestaña "Suscripción" para activarla.
                    </AlertDescription>
                  </Alert>
                )}
                <CompanyProfileForm />
              </TabsContent>

              <TabsContent value="usuarios" className="space-y-6">
                {!subscriptionInfo.isActive && (
                  <Alert variant="warning" className="bg-amber-50 border-amber-200">
                    <AlertTitle className="text-amber-800">
                      Se requiere una suscripción
                    </AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Para poder acceder a todas las funcionalidades, su empresa necesita una suscripción activa.
                      Por favor, vaya a la pestaña "Suscripción" para activarla.
                    </AlertDescription>
                  </Alert>
                )}
                <UserManagementTable />
              </TabsContent>

              <TabsContent value="suscripcion" className="space-y-6">
                {!subscriptionInfo.isActive && (
                  <SubscriptionRequiredDialog />
                )}
                {subscriptionInfo.isActive && <SubscriptionPlans />}
              </TabsContent>
            </>
          )}

          <TabsContent value="cuenta" className="space-y-6">
            {!subscriptionInfo.isActive && empresaId && (
              <Alert variant="warning" className="bg-amber-50 border-amber-200">
                <AlertTitle className="text-amber-800">
                  Se requiere una suscripción
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  Su empresa no cuenta con una suscripción activa. Algunas funcionalidades estarán limitadas.
                  {!isAdmin() && " Por favor, contacte al administrador de su empresa."}
                </AlertDescription>
              </Alert>
            )}
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default ConfiguracionPage;
