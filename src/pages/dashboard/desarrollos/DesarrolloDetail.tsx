import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Calendar, MapPin, User, Clipboard, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import DesarrolloImageCarousel from '@/components/dashboard/DesarrolloImageCarousel';
import useUserRole from '@/hooks/useUserRole';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import DesarrolloEditButton from '@/components/dashboard/DesarrolloEditButton';
import useDesarrolloImagenes from '@/hooks/useDesarrolloImagenes';
import useDesarrolloStats from '@/hooks/useDesarrolloStats';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useDesarrollos } from '@/hooks/useDesarrollos';
import { Json } from '@/integrations/supabase/types';

interface Desarrollo {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string | null;
  avance_porcentaje: number | null;
  imagen_url: string | null;
  total_unidades: number;
  unidades_disponibles: number;
  fecha_inicio: string | null;
  fecha_entrega: string | null;
  empresa_id?: number | null;
  // Financial fields
  adr_base?: number | null;
  amenidades?: Json | null;
  comision_operador?: number | null;
  es_gastos_fijos_porcentaje?: boolean | null;
  es_gastos_variables_porcentaje?: boolean | null;
  es_impuestos_porcentaje?: boolean | null;
  es_mantenimiento_porcentaje?: boolean | null;
  gastos_fijos?: number | null;
  gastos_variables?: number | null;
  impuestos?: number | null;
  mantenimiento_valor?: number | null;
  moneda?: string | null;
  ocupacion_anual?: number | null;
}

const DesarrolloDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { desarrollos } = useDesarrollos();
  const { userData, isAdmin } = useUserRole();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('informacion');
  const [isAddPrototipoOpen, setIsAddPrototipoOpen] = useState(false);
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [desarrollo, setDesarrollo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { images, isLoading: imagesLoading, refetch: refetchImages } = 
    useDesarrolloImagenes(id || '');
  
  const { stats, isLoading: statsLoading } = useDesarrolloStats(id || '');
  
  useEffect(() => {
    const fetchDesarrollo = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('desarrollos')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setDesarrollo(data);
        }
      } catch (error) {
        console.error('Error fetching desarrollo:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el desarrollo',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDesarrollo();
  }, [id, toast]);
  
  const calculateProgress = () => {
    if (!desarrollo) return 0;
    const sold = desarrollo.total_unidades - desarrollo.unidades_disponibles;
    return (sold / desarrollo.total_unidades) * 100;
  };
  
  const progress = calculateProgress();
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!desarrollo) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button 
            onClick={() => navigate('/dashboard/desarrollos')}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Desarrollo no encontrado</h2>
            <p className="text-slate-600">El desarrollo que buscas no existe o no tienes permisos para verlo.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/dashboard/desarrollos')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            
            <h1 className="text-2xl font-bold text-slate-800">{desarrollo.nombre}</h1>
          </div>
          
          <div className="flex space-x-2">
            {isAdmin && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddImageOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar imagen
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsAddPrototipoOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar prototipo
                </Button>
              </>
            )}
            
            <DesarrolloEditButton 
              desarrollo={desarrollo}
              onSuccess={() => {
                // Refresh the desarrollo data
                window.location.reload();
              }}
            />
          </div>
        </div>
        
        <DesarrolloImageCarousel 
          desarrolloId={id || ''} 
          editable={isAdmin} 
        />
        
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="informacion">Información</TabsTrigger>
              <TabsTrigger value="prototipos">Prototipos</TabsTrigger>
              <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
              <TabsTrigger value="financieros">Datos Financieros</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informacion" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detalles del Desarrollo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span>{desarrollo.nombre}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{desarrollo.ubicacion}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>
                      {desarrollo.fecha_inicio
                        ? new Date(desarrollo.fecha_inicio).toLocaleDateString()
                        : 'Fecha de inicio no especificada'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>
                      {desarrollo.fecha_entrega
                        ? new Date(desarrollo.fecha_entrega).toLocaleDateString()
                        : 'Fecha de entrega no especificada'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>{desarrollo.total_unidades} Unidades en total</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clipboard className="h-4 w-4 text-slate-500" />
                    <span>{desarrollo.descripcion || 'Sin descripción'}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prototipos">
              <Card>
                <CardHeader>
                  <CardTitle>Prototipos</CardTitle>
                </CardHeader>
                <CardContent>
                  Lista de prototipos
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="estadisticas">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Desarrollo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progreso de ventas</span>
                          <span className="text-sm text-slate-500">{progress.toFixed(2)}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Unidades</h3>
                          <p>Total: {desarrollo.total_unidades}</p>
                          <p>Disponibles: {desarrollo.unidades_disponibles}</p>
                          <p>Vendidas: {desarrollo.total_unidades - desarrollo.unidades_disponibles}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Ingresos</h3>
                          <p>Ingresos Estimados: {stats?.ingresos_estimados}</p>
                          <p>Ingresos Recibidos: {stats?.ingresos_recibidos}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="financieros">
              <Card>
                <CardHeader>
                  <CardTitle>Datos Financieros</CardTitle>
                </CardHeader>
                <CardContent>
                  Datos financieros del desarrollo
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <AdminResourceDialog
          resourceType="prototipos"
          open={isAddPrototipoOpen}
          onClose={() => setIsAddPrototipoOpen(false)}
          onSuccess={() => {
            setIsAddPrototipoOpen(false);
            window.location.reload();
          }}
          desarrolloId={id}
        />
        
        <AdminResourceDialog
          resourceType="desarrollos"
          open={isAddImageOpen}
          onClose={() => setIsAddImageOpen(false)}
          onSuccess={() => {
            setIsAddImageOpen(false);
            refetchImages();
          }}
          resourceId={id}
        />
      </div>
    </DashboardLayout>
  );
};

export default DesarrolloDetail;
