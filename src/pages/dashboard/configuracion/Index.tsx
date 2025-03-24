
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyProfileForm from "@/components/dashboard/configuracion/CompanyProfileForm";
import { UserManagementTable } from "@/components/dashboard/configuracion/UserManagementTable";
import SubscriptionPlans from "@/components/dashboard/configuracion/SubscriptionPlans";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<string>("perfil");
  const { isAdmin, userName, userEmail, isLoading: userLoading, userId } = useUserRole();
  const { toast } = useToast();

  console.log("ConfiguracionPage - userId:", userId);
  console.log("ConfiguracionPage - Admin status:", isAdmin());
  console.log("ConfiguracionPage - userLoading:", userLoading);

  // Set default tab based on user role
  useEffect(() => {
    console.log("Setting default tab based on admin status:", isAdmin());
    if (!isAdmin()) {
      setActiveTab("cuenta");
    }
  }, [isAdmin]);

  // Simple account settings component for the "Mi Cuenta" tab
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

  if (userLoading) {
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
            {adminStatus && (
              <>
                <TabsTrigger value="perfil">Perfil de Empresa</TabsTrigger>
                <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                <TabsTrigger value="suscripcion">Suscripción</TabsTrigger>
              </>
            )}
            <TabsTrigger value="cuenta">Mi Cuenta</TabsTrigger>
          </TabsList>

          {adminStatus && (
            <>
              <TabsContent value="perfil" className="space-y-6">
                <CompanyProfileForm />
              </TabsContent>

              <TabsContent value="usuarios" className="space-y-6">
                <UserManagementTable />
              </TabsContent>

              <TabsContent value="suscripcion" className="space-y-6">
                <SubscriptionPlans />
              </TabsContent>
            </>
          )}

          <TabsContent value="cuenta" className="space-y-6">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default ConfiguracionPage;
