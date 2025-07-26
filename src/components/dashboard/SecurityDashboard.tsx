import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Shield, Clock, Eye } from 'lucide-react';
import { useSecurityEvents, SecurityEvent } from '@/hooks/useSecurityEvents';
import { useToast } from '@/hooks/use-toast';

const SecurityDashboard: React.FC = () => {
  const { securityEvents, isLoading, error } = useSecurityEvents();
  const { toast } = useToast();

  if (error) {
    toast({
      title: 'Error',
      description: 'No se pudieron cargar los eventos de seguridad',
      variant: 'destructive',
    });
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="bg-red-500 text-white">Crítico</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500 text-white">Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Medio</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-500 text-white">Bajo</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('login') || eventType.includes('blocked')) {
      return <Shield className="h-4 w-4" />;
    }
    if (eventType.includes('failed') || eventType.includes('error')) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Eye className="h-4 w-4" />;
  };

  const formatEventType = (eventType: string) => {
    const types: Record<string, string> = {
      'login_attempt': 'Intento de Inicio de Sesión',
      'failed_login': 'Inicio de Sesión Fallido',
      'blocked_login_attempt': 'Intento Bloqueado',
      'signup_attempt': 'Intento de Registro',
      'password_reset': 'Restablecimiento de Contraseña',
      'account_lockout': 'Cuenta Bloqueada',
      'suspicious_activity': 'Actividad Sospechosa',
    };
    return types[eventType] || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const recentCriticalEvents = securityEvents.filter(event => 
    event.severity === 'critical' || event.severity === 'high'
  ).slice(0, 5);

  const loginAttempts = securityEvents.filter(event => 
    event.event_type.includes('login')
  ).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Panel de Seguridad</h1>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eventos Críticos (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {recentCriticalEvents.filter(event => 
                new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Intentos de Login (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {loginAttempts.filter(event => 
                new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {securityEvents.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Events */}
      {recentCriticalEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Eventos Críticos Recientes
            </CardTitle>
            <CardDescription>
              Eventos de seguridad de alta prioridad que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {recentCriticalEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg bg-red-50 border-red-200">
                    {getEventTypeIcon(event.event_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {formatEventType(event.event_type)}
                        </span>
                        {getSeverityBadge(event.severity)}
                      </div>
                      {event.email && (
                        <p className="text-sm text-muted-foreground mb-1">
                          Usuario: {event.email}
                        </p>
                      )}
                      {event.ip_address && (
                        <p className="text-sm text-muted-foreground mb-1">
                          IP: {event.ip_address}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* All Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Eventos de Seguridad</CardTitle>
          <CardDescription>
            Historial completo de eventos de seguridad del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    {getEventTypeIcon(event.event_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {formatEventType(event.event_type)}
                        </span>
                        {getSeverityBadge(event.severity)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {event.email && (
                          <div>Usuario: {event.email}</div>
                        )}
                        {event.ip_address && (
                          <div>IP: {event.ip_address}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                ))}
                {securityEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay eventos de seguridad registrados
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;