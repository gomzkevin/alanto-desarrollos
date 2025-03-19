import { useUserRole } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserManagement from '@/components/dashboard/UserManagement';

const ConfiguracionIndex = () => {
  const { isAdmin } = useUserRole();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      
      <div className="space-y-6">
        {isAdmin() && (
          <UserManagement />
        )}
        
        {/* Other configuration components can be added here */}
        
        {!isAdmin() && (
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                No tienes permisos para acceder a esta sección
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Esta sección es solo para administradores. Si necesitas acceso, contacta a un administrador.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionIndex;
