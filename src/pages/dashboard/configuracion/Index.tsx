
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyProfileForm from "@/components/dashboard/configuracion/CompanyProfileForm";
import UserManagementTable from "@/components/dashboard/configuracion/UserManagementTable";
import SubscriptionPlans from "@/components/dashboard/configuracion/SubscriptionPlans";
import { useUserRole } from "@/hooks/useUserRole";

export function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const { isAdmin } = useUserRole();

  // Set default tab based on user role
  useEffect(() => {
    if (isAdmin()) {
      setActiveTab("perfil");
    } else {
      setActiveTab("cuenta");
    }
  }, [isAdmin]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-1">
            Administra la configuración de tu cuenta y empresa
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-6">
            {isAdmin() && (
              <>
                <TabsTrigger value="perfil">Perfil de Empresa</TabsTrigger>
                <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                <TabsTrigger value="suscripcion">Suscripción</TabsTrigger>
              </>
            )}
            <TabsTrigger value="cuenta">Mi Cuenta</TabsTrigger>
          </TabsList>

          {isAdmin() && (
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
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Configuración de Cuenta</h3>
              <p className="text-slate-600">
                Esta sección está en desarrollo. Pronto podrás cambiar tu contraseña y otros detalles de tu cuenta.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default ConfiguracionPage;
