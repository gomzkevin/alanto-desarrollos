
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Trash, Plus, Settings, Users, Building2, CreditCard, Globe } from 'lucide-react';
import useDesarrollos from '@/hooks/useDesarrollos';
import { supabase } from '@/integrations/supabase/client';
import { Desarrollo } from '@/hooks/useDesarrollos';

// Definimos los tipos para la configuración general
interface ConfiguracionFinanciera {
  tipoCambio: number;
  tasaInteres: number;
  moneda: string;
  comisionOperador: number;
  mantenimientoValor: number;
  esMantenimientoPorcentaje: boolean;
  gastosFijos: number;
  esGastosFijosPorcentaje: boolean;
  gastosVariables: number;
  esGastosVariablesPorcentaje: boolean;
  impuestos: number;
  esImpuestosPorcentaje: boolean;
  adr_base?: number;
  ocupacion_anual?: number;
}

// Definimos los tipos para la configuración del desarrollo
interface DesarrolloConfiguracion {
  id: string;
  nombre: string;
  moneda: string;
  comision_operador: number;
  mantenimiento_valor: number;
  es_mantenimiento_porcentaje: boolean;
  gastos_fijos: number;
  es_gastos_fijos_porcentaje: boolean;
  gastos_variables: number;
  es_gastos_variables_porcentaje: boolean;
  impuestos: number;
  es_impuestos_porcentaje: boolean;
  adr_base?: number;
  ocupacion_anual?: number;
}

// Datos de ejemplo para la configuración
const configData = {
  finanzas: {
    tipoCambio: 17.5,
    tasaInteres: 7,
    moneda: 'MXN',
    comisionOperador: 15,
    mantenimientoValor: 5,
    esMantenimientoPorcentaje: true,
    gastosFijos: 2500,
    esGastosFijosPorcentaje: false,
    gastosVariables: 12,
    esGastosVariablesPorcentaje: true,
    impuestos: 35,
    esImpuestosPorcentaje: true,
    adr_base: 1800,
    ocupacion_anual: 70
  },
  empresa: {
    nombre: 'Inversiones Turísticas S.A. de C.V.',
    email: 'contacto@empresa.com',
    telefono: '+52 55 1234 5678',
    direccion: 'Av. Paseo de la Reforma 296, Juárez, CDMX',
    rfc: 'ITS200101XYZ',
    sitioWeb: 'www.empresa.com',
    logo: '/placeholder.svg'
  }
};

const ConfiguracionPage = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(true);
  const [finanzasConfig, setFinanzasConfig] = useState<ConfiguracionFinanciera>(configData.finanzas);
  const [empresaConfig, setEmpresaConfig] = useState(configData.empresa);
  const [loading, setLoading] = useState(false);
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('');
  const [desarrolloConfig, setDesarrolloConfig] = useState<DesarrolloConfiguracion | null>(null);
  
  const { desarrollos = [], isLoading: isLoadingDesarrollos } = useDesarrollos();
  
  const [usuarios, setUsuarios] = useState([
    { id: '1', nombre: 'Juan Pérez', email: 'juan@ejemplo.com', rol: 'admin', activo: true },
    { id: '2', nombre: 'Ana López', email: 'ana@ejemplo.com', rol: 'vendedor', activo: true },
    { id: '3', nombre: 'Carlos Rodríguez', email: 'carlos@ejemplo.com', rol: 'vendedor', activo: false }
  ]);

  // Fetch global financial configuration from Supabase
  useEffect(() => {
    const fetchGlobalConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('configuracion_financiera')
          .select('*')
          .eq('id', 1)
          .single();
          
        if (error) {
          console.error('Error fetching financial configuration:', error);
          return;
        }
        
        if (data) {
          // Map database fields to our state structure
          setFinanzasConfig({
            tipoCambio: data.tipo_cambio || 17.5,
            tasaInteres: data.tasa_interes || 7,
            moneda: data.moneda || 'MXN',
            comisionOperador: data.comision_operador || 15,
            mantenimientoValor: data.mantenimiento_valor || 5,
            esMantenimientoPorcentaje: data.es_mantenimiento_porcentaje !== null ? data.es_mantenimiento_porcentaje : true,
            gastosFijos: data.gastos_fijos || 2500,
            esGastosFijosPorcentaje: data.es_gastos_fijos_porcentaje !== null ? data.es_gastos_fijos_porcentaje : false,
            gastosVariables: data.gastos_variables || 12,
            esGastosVariablesPorcentaje: data.es_gastos_variables_porcentaje !== null ? data.es_gastos_variables_porcentaje : true,
            impuestos: data.impuestos || 35,
            esImpuestosPorcentaje: data.es_impuestos_porcentaje !== null ? data.es_impuestos_porcentaje : true,
            adr_base: data.adr_base || 1800,
            ocupacion_anual: data.ocupacion_anual || 70
          });
        }
      } catch (err) {
        console.error('Error fetching global config:', err);
      }
    };
    
    fetchGlobalConfig();
    
    // Verificar si el usuario es administrador
    // const checkUserRole = async () => {
    //   const user = await getCurrentUser();
    //   const { data } = await supabase
    //     .from('usuarios')
    //     .select('rol')
    //     .eq('id', user.id)
    //     .single();
    //   
    //   setIsAdmin(data?.rol === 'admin');
    // };
    
    // checkUserRole();
  }, []);

  // Cargar la configuración del desarrollo seleccionado
  useEffect(() => {
    if (selectedDesarrolloId) {
      const loadDesarrolloConfig = async () => {
        try {
          const { data, error } = await supabase
            .from('desarrollos')
            .select('*')
            .eq('id', selectedDesarrolloId)
            .single();
            
          if (error) {
            console.error('Error al cargar la configuración del desarrollo:', error);
            return;
          }
          
          if (data) {
            // Prepara los datos del desarrollo para su edición
            setDesarrolloConfig({
              id: data.id,
              nombre: data.nombre,
              moneda: data.moneda || 'MXN',
              comision_operador: data.comision_operador || 15,
              mantenimiento_valor: data.mantenimiento_valor || 5,
              es_mantenimiento_porcentaje: data.es_mantenimiento_porcentaje !== undefined ? data.es_mantenimiento_porcentaje : true,
              gastos_fijos: data.gastos_fijos || 2500,
              es_gastos_fijos_porcentaje: data.es_gastos_fijos_porcentaje !== undefined ? data.es_gastos_fijos_porcentaje : false,
              gastos_variables: data.gastos_variables || 12,
              es_gastos_variables_porcentaje: data.es_gastos_variables_porcentaje !== undefined ? data.es_gastos_variables_porcentaje : true,
              impuestos: data.impuestos || 35,
              es_impuestos_porcentaje: data.es_impuestos_porcentaje !== undefined ? data.es_impuestos_porcentaje : true,
              adr_base: data.adr_base || 1800,
              ocupacion_anual: data.ocupacion_anual || 70
            });
          }
        } catch (error) {
          console.error('Error al cargar la configuración del desarrollo:', error);
        }
      };
      
      loadDesarrolloConfig();
    } else {
      setDesarrolloConfig(null);
    }
  }, [selectedDesarrolloId]);

  const handleSaveFinanzas = async () => {
    setLoading(true);
    
    try {
      if (selectedDesarrolloId && desarrolloConfig) {
        // Guardar la configuración específica del desarrollo
        const { error } = await supabase
          .from('desarrollos')
          .update({
            moneda: desarrolloConfig.moneda,
            comision_operador: desarrolloConfig.comision_operador,
            mantenimiento_valor: desarrolloConfig.mantenimiento_valor,
            es_mantenimiento_porcentaje: desarrolloConfig.es_mantenimiento_porcentaje,
            gastos_fijos: desarrolloConfig.gastos_fijos,
            es_gastos_fijos_porcentaje: desarrolloConfig.es_gastos_fijos_porcentaje,
            gastos_variables: desarrolloConfig.gastos_variables,
            es_gastos_variables_porcentaje: desarrolloConfig.es_gastos_variables_porcentaje,
            impuestos: desarrolloConfig.impuestos,
            es_impuestos_porcentaje: desarrolloConfig.es_impuestos_porcentaje,
            adr_base: desarrolloConfig.adr_base,
            ocupacion_anual: desarrolloConfig.ocupacion_anual
          })
          .eq('id', selectedDesarrolloId);
        
        if (error) {
          console.error('Error al guardar la configuración del desarrollo:', error);
          toast({
            title: "Error al guardar",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Configuración guardada",
            description: "La configuración del desarrollo ha sido actualizada correctamente.",
          });
        }
      } else {
        // Guardar la configuración global
        const { error } = await supabase
          .from('configuracion_financiera')
          .update({
            tipo_cambio: finanzasConfig.tipoCambio,
            tasa_interes: finanzasConfig.tasaInteres,
            moneda: finanzasConfig.moneda,
            comision_operador: finanzasConfig.comisionOperador,
            mantenimiento_valor: finanzasConfig.mantenimientoValor,
            es_mantenimiento_porcentaje: finanzasConfig.esMantenimientoPorcentaje,
            gastos_fijos: finanzasConfig.gastosFijos,
            es_gastos_fijos_porcentaje: finanzasConfig.esGastosFijosPorcentaje,
            gastos_variables: finanzasConfig.gastosVariables,
            es_gastos_variables_porcentaje: finanzasConfig.esGastosVariablesPorcentaje,
            impuestos: finanzasConfig.impuestos,
            es_impuestos_porcentaje: finanzasConfig.esImpuestosPorcentaje,
            adr_base: finanzasConfig.adr_base,
            ocupacion_anual: finanzasConfig.ocupacion_anual
          })
          .eq('id', 1);
          
        if (error) {
          console.error('Error al guardar la configuración global:', error);
          toast({
            title: "Error al guardar",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Configuración guardada",
            description: "Los parámetros financieros globales han sido actualizados correctamente.",
          });
        }
      }
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      toast({
        title: "Error al guardar",
        description: "Ha ocurrido un error al guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmpresa = () => {
    setLoading(true);
    
    // Simular guardado en Supabase
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Datos de empresa actualizados",
        description: "La información de la empresa ha sido actualizada.",
      });
    }, 1000);
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Acceso restringido</CardTitle>
              <CardDescription>
                No tienes permisos para acceder a la configuración del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Esta sección está disponible únicamente para administradores. Si necesitas acceso, contacta a tu administrador.
              </p>
              <Button variant="outline" asChild>
                <a href="/dashboard">Volver al dashboard</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
          <p className="text-slate-600">Administra los parámetros globales del sistema</p>
        </div>
        
        <Tabs defaultValue="finanzas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="finanzas" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Parámetros financieros</span>
            </TabsTrigger>
            <TabsTrigger value="empresa" className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              <span>Datos de empresa</span>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Sistema</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="finanzas">
            <Card>
              <CardHeader>
                <CardTitle>Parámetros financieros globales</CardTitle>
                <CardDescription>
                  Estos valores se utilizarán como base para las proyecciones y cotizaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selector de desarrollo para configuración específica */}
                <div className="mb-6">
                  <Label htmlFor="desarrolloSelect" className="block text-lg font-medium mb-2">
                    Selecciona un desarrollo para configurar sus parámetros específicos
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedDesarrolloId}
                      onValueChange={setSelectedDesarrolloId}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Parámetros globales (por defecto)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Parámetros globales (por defecto)</SelectItem>
                        {desarrollos.map((desarrollo) => (
                          <SelectItem key={desarrollo.id} value={desarrollo.id}>
                            {desarrollo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDesarrolloId && (
                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedDesarrolloId('')}
                      >
                        Volver a parámetros globales
                      </Button>
                    )}
                  </div>
                  {selectedDesarrolloId && desarrolloConfig && (
                    <p className="text-sm text-slate-500 mt-2">
                      Estás editando la configuración específica para: <span className="font-medium">{desarrolloConfig.nombre}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Nivel 1: Configuración global para la plataforma */}
                  {!selectedDesarrolloId && (
                    <div className="space-y-4">
                      <div className="flex items-center mb-2">
                        <Globe className="mr-2 h-5 w-5 text-slate-500" />
                        <h3 className="text-lg font-medium">Configuración global para la plataforma</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
                        <div className="space-y-2">
                          <Label htmlFor="tipoCambio">Tipo de cambio (MXN/USD)</Label>
                          <Input
                            id="tipoCambio"
                            type="number"
                            step="0.01"
                            value={finanzasConfig.tipoCambio}
                            onChange={(e) => setFinanzasConfig({...finanzasConfig, tipoCambio: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tasaInteres">Tasa de interés comparativa</Label>
                          <div className="flex">
                            <Input
                              id="tasaInteres"
                              type="number"
                              step="0.1"
                              value={finanzasConfig.tasaInteres}
                              onChange={(e) => setFinanzasConfig({...finanzasConfig, tasaInteres: parseFloat(e.target.value) || 0})}
                            />
                            <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                              <span className="text-sm text-slate-500">%</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">Rendimiento de inversión alternativa para comparar ROI</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="adr_base">ADR Promedio base</Label>
                          <div className="flex">
                            <Input
                              id="adr_base"
                              type="number"
                              step="1"
                              value={finanzasConfig.adr_base || 1800}
                              onChange={(e) => setFinanzasConfig({...finanzasConfig, adr_base: parseFloat(e.target.value) || 0})}
                            />
                            <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                              <span className="text-sm text-slate-500">$</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">Tarifa diaria promedio para cálculos de proyección</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ocupacion_anual">Ocupación anual promedio</Label>
                          <div className="flex">
                            <Input
                              id="ocupacion_anual"
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={finanzasConfig.ocupacion_anual || 70}
                              onChange={(e) => setFinanzasConfig({...finanzasConfig, ocupacion_anual: parseInt(e.target.value) || 0})}
                            />
                            <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                              <span className="text-sm text-slate-500">%</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">Porcentaje promedio de ocupación para cálculos de proyección</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!selectedDesarrolloId && <Separator />}
                  
                  {/* Nivel 2: Configuración por desarrollo */}
                  <div className="space-y-4">
                    <div className="flex items-center mb-2">
                      <Building2 className="mr-2 h-5 w-5 text-slate-500" />
                      <h3 className="text-lg font-medium">
                        {selectedDesarrolloId && desarrolloConfig
                          ? `Configuración para ${desarrolloConfig.nombre}` 
                          : 'Configuración por desarrollo (valores predeterminados)'}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
                      <div className="space-y-2">
                        <Label htmlFor="moneda">Moneda principal</Label>
                        <Select
                          value={selectedDesarrolloId && desarrolloConfig ? desarrolloConfig.moneda : finanzasConfig.moneda}
                          onValueChange={(value) => {
                            if (selectedDesarrolloId && desarrolloConfig) {
                              setDesarrolloConfig({...desarrolloConfig, moneda: value});
                            } else {
                              setFinanzasConfig({...finanzasConfig, moneda: value});
                            }
                          }}
                        >
                          <SelectTrigger id="moneda">
                            <SelectValue placeholder="Selecciona moneda" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
                            <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comisionOperador">Comisión del operador</Label>
                        <div className="flex">
                          <Input
                            id="comisionOperador"
                            type="number"
                            min="0"
                            max="100"
                            value={selectedDesarrolloId && desarrolloConfig ? desarrolloConfig.comision_operador : finanzasConfig.comisionOperador}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              if (selectedDesarrolloId && desarrolloConfig) {
                                setDesarrolloConfig({...desarrolloConfig, comision_operador: value});
                              } else {
                                setFinanzasConfig({...finanzasConfig, comisionOperador: value});
                              }
                            }}
                          />
                          <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                            <span className="text-sm text-slate-500">%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="mantenimientoValor">Mantenimiento</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="mantenimientoTipo"
                              checked={selectedDesarrolloId && desarrolloConfig 
                                ? desarrolloConfig.es_mantenimiento_porcentaje 
                                : finanzasConfig.esMantenimientoPorcentaje}
                              onCheckedChange={(checked) => {
                                if (selectedDesarrolloId && desarrolloConfig) {
                                  setDesarrolloConfig({...desarrolloConfig, es_mantenimiento_porcentaje: checked});
                                } else {
                                  setFinanzasConfig({...finanzasConfig, esMantenimientoPorcentaje: checked});
                                }
                              }}
                            />
                            <Label htmlFor="mantenimientoTipo" className="text-xs">
                              {(selectedDesarrolloId && desarrolloConfig 
                                ? desarrolloConfig.es_mantenimiento_porcentaje 
                                : finanzasConfig.esMantenimientoPorcentaje) 
                                ? 'Porcentaje' : 'Monto fijo'}
                            </Label>
                          </div>
                        </div>
                        <div className="flex">
                          <Input
                            id="mantenimientoValor"
                            type="number"
                            value={selectedDesarrolloId && desarrolloConfig 
                              ? desarrolloConfig.mantenimiento_valor 
                              : finanzasConfig.mantenimientoValor}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (selectedDesarrolloId && desarrolloConfig) {
                                setDesarrolloConfig({...desarrolloConfig, mantenimiento_valor: value});
                              } else {
                                setFinanzasConfig({...finanzasConfig, mantenimientoValor: value});
                              }
                            }}
                          />
                          <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                            <span className="text-sm text-slate-500">
                              {(selectedDesarrolloId && desarrolloConfig 
                                ? desarrolloConfig.es_mantenimiento_porcentaje 
                                : finanzasConfig.esMantenimientoPorcentaje)
                                ? '%' 
                                : (selectedDesarrolloId && desarrolloConfig 
                                  ? desarrolloConfig.moneda 
                                  : finanzasConfig.moneda)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="gastosFijos">Gastos fijos anuales</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="gastosFijosTipo"
                              checked={selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_gastos_fijos_porcentaje
                                : finanzasConfig.esGastosFijosPorcentaje}
                              onCheckedChange={(checked) => {
                                if (selectedDesarrolloId && desarrolloConfig) {
                                  setDesarrolloConfig({...desarrolloConfig, es_gastos_fijos_porcentaje: checked});
                                } else {
                                  setFinanzasConfig({...finanzasConfig, esGastosFijosPorcentaje: checked});
                                }
                              }}
                            />
                            <Label htmlFor="gastosFijosTipo" className="text-xs">
                              {(selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_gastos_fijos_porcentaje
                                : finanzasConfig.esGastosFijosPorcentaje)
                                ? 'Porcentaje' : 'Monto fijo'}
                            </Label>
                          </div>
                        </div>
                        <div className="flex">
                          <Input
                            id="gastosFijos"
                            type="number"
                            value={selectedDesarrolloId && desarrolloConfig
                              ? desarrolloConfig.gastos_fijos
                              : finanzasConfig.gastosFijos}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (selectedDesarrolloId && desarrolloConfig) {
                                setDesarrolloConfig({...desarrolloConfig, gastos_fijos: value});
                              } else {
                                setFinanzasConfig({...finanzasConfig, gastosFijos: value});
                              }
                            }}
                          />
                          <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                            <span className="text-sm text-slate-500">
                              {(selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_gastos_fijos_porcentaje
                                : finanzasConfig.esGastosFijosPorcentaje)
                                ? '%'
                                : (selectedDesarrolloId && desarrolloConfig
                                  ? desarrolloConfig.moneda
                                  : finanzasConfig.moneda)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="gastosVariables">Gastos variables anuales</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="gastosVariablesTipo"
                              checked={selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_gastos_variables_porcentaje
                                : finanzasConfig.esGastosVariablesPorcentaje}
                              onCheckedChange={(checked) => {
                                if (selectedDesarrolloId && desarrolloConfig) {
                                  setDesarrolloConfig({...desarrolloConfig, es_gastos_variables_porcentaje: checked});
                                } else {
                                  setFinanzasConfig({...finanzasConfig, esGastosVariablesPorcentaje: checked});
                                }
                              }}
                            />
                            <Label htmlFor="gastosVariablesTipo" className="text-xs">
                              {(selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_gastos_variables_porcentaje
                                : finanzasConfig.esGastosVariablesPorcentaje)
                                ? 'Porcentaje' : 'Monto fijo'}
                            </Label>
                          </div>
                        </div>
                        <div className="flex">
                          <Input
                            id="gastosVariables"
                            type="number"
                            value={selectedDesarrolloId && desarrolloConfig
                              ? desarrolloConfig.gastos_variables
                              : finanzasConfig.gastosVariables}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (selectedDesarrolloId && desarrolloConfig) {
                                setDesarrolloConfig({...desarrolloConfig, gastos_variables: value});
                              } else {
                                setFinanzasConfig({...finanzasConfig, gastosVariables: value});
                              }
                            }}
                          />
                          <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                            <span className="text-sm text-slate-500">
                              {(selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_gastos_variables_porcentaje
                                : finanzasConfig.esGastosVariablesPorcentaje)
                                ? '%'
                                : (selectedDesarrolloId && desarrolloConfig
                                  ? desarrolloConfig.moneda
                                  : finanzasConfig.moneda)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="impuestos">Impuestos anuales</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="impuestosTipo"
                              checked={selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_impuestos_porcentaje
                                : finanzasConfig.esImpuestosPorcentaje}
                              onCheckedChange={(checked) => {
                                if (selectedDesarrolloId && desarrolloConfig) {
                                  setDesarrolloConfig({...desarrolloConfig, es_impuestos_porcentaje: checked});
                                } else {
                                  setFinanzasConfig({...finanzasConfig, esImpuestosPorcentaje: checked});
                                }
                              }}
                            />
                            <Label htmlFor="impuestosTipo" className="text-xs">
                              {(selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_impuestos_porcentaje
                                : finanzasConfig.esImpuestosPorcentaje)
                                ? 'Porcentaje' : 'Monto fijo'}
                            </Label>
                          </div>
                        </div>
                        <div className="flex">
                          <Input
                            id="impuestos"
                            type="number"
                            value={selectedDesarrolloId && desarrolloConfig
                              ? desarrolloConfig.impuestos
                              : finanzasConfig.impuestos}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (selectedDesarrolloId && desarrolloConfig) {
                                setDesarrolloConfig({...desarrolloConfig, impuestos: value});
                              } else {
                                setFinanzasConfig({...finanzasConfig, impuestos: value});
                              }
                            }}
                          />
                          <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                            <span className="text-sm text-slate-500">
                              {(selectedDesarrolloId && desarrolloConfig
                                ? desarrolloConfig.es_impuestos_porcentaje
                                : finanzasConfig.esImpuestosPorcentaje)
                                ? '%'
                                : (selectedDesarrolloId && desarrolloConfig
                                  ? desarrolloConfig.moneda
                                  : finanzasConfig.moneda)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* ADR base y ocupación para desarrollo específico */}
                      {selectedDesarrolloId && desarrolloConfig && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="adr_base_desarrollo">ADR Promedio base</Label>
                            <div className="flex">
                              <Input
                                id="adr_base_desarrollo"
                                type="number"
                                step="1"
                                value={desarrolloConfig.adr_base || 1800}
                                onChange={(e) => setDesarrolloConfig({
                                  ...desarrolloConfig, 
                                  adr_base: parseFloat(e.target.value) || 0
                                })}
                              />
                              <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                                <span className="text-sm text-slate-500">$</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="ocupacion_anual_desarrollo">Ocupación anual promedio</Label>
                            <div className="flex">
                              <Input
                                id="ocupacion_anual_desarrollo"
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                value={desarrolloConfig.ocupacion_anual || 70}
                                onChange={(e) => setDesarrolloConfig({
                                  ...desarrolloConfig, 
                                  ocupacion_anual: parseInt(e.target.value) || 0
                                })}
                              />
                              <div className="flex items-center justify-center w-16 h-10 bg-slate-100 border border-l-0 border-slate-200 rounded-r-md">
                                <span className="text-sm text-slate-500">%</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Nivel 3: Configuración por prototipo (placeholder) */}
                  <div className="space-y-4">
                    <div className="flex items-center mb-2">
                      <CreditCard className="mr-2 h-5 w-5 text-slate-500" />
                      <h3 className="text-lg font-medium">Configuración por prototipo</h3>
                    </div>
                    
                    <div className="pl-7">
                      <p className="text-slate-500 italic">
                        Configuración por definir. Estos parámetros se personalizarán para cada prototipo.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline">Restablecer valores predeterminados</Button>
                  <Button onClick={handleSaveFinanzas} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar configuración'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle>Datos de empresa</CardTitle>
                <CardDescription>
                  Esta información se utilizará en documentos y comunicaciones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nombreEmpresa">Nombre de la empresa</Label>
                    <Input
                      id="nombreEmpresa"
                      value={empresaConfig.nombre}
                      onChange={(e) => setEmpresaConfig({...empresaConfig, nombre: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC</Label>
                    <Input
                      id="rfc"
                      value={empresaConfig.rfc}
                      onChange={(e) => setEmpresaConfig({...empresaConfig, rfc: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emailEmpresa">Email</Label>
                    <Input
                      id="emailEmpresa"
                      type="email"
                      value={empresaConfig.email}
                      onChange={(e) => setEmpresaConfig({...empresaConfig, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefonoEmpresa">Teléfono</Label>
                    <Input
                      id="telefonoEmpresa"
                      value={empresaConfig.telefono}
                      onChange={(e) => setEmpresaConfig({...empresaConfig, telefono: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sitioWeb">Sitio web</Label>
                    <Input
                      id="sitioWeb"
                      value={empresaConfig.sitioWeb}
                      onChange={(e) => setEmpresaConfig({...empresaConfig, sitioWeb: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="direccionEmpresa">Dirección</Label>
                    <Input
                      id="direccionEmpresa"
                      value={empresaConfig.direccion}
                      onChange={(e) => setEmpresaConfig({...empresaConfig, direccion: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logoEmpresa">Logo</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden bg-white">
                      <img 
                        src={empresaConfig.logo || '/placeholder.svg'} 
                        alt="Logo empresa" 
                        className="max-w-full max-h-full" 
                      />
                    </div>
                    <div>
                      <Button type="button" variant="outline" size="sm">
                        <label htmlFor="logoUpload" className="cursor-pointer">
                          Seleccionar archivo
                          <input 
                            id="logoUpload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                          />
                        </label>
                      </Button>
                      <p className="text-xs text-slate-500 mt-1">
                        Formatos soportados: JPG, PNG, SVG. Tamaño máximo: 2MB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline">Cancelar</Button>
                  <Button onClick={handleSaveEmpresa} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar información'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usuarios">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Gestión de usuarios</CardTitle>
                    <CardDescription>
                      Administra a los usuarios que tienen acceso al sistema
                    </CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo usuario
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left font-medium">Nombre</th>
                          <th className="px-4 py-3 text-left font-medium">Email</th>
                          <th className="px-4 py-3 text-left font-medium">Rol</th>
                          <th className="px-4 py-3 text-left font-medium">Estado</th>
                          <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((usuario) => (
                          <tr key={usuario.id} className="border-b">
                            <td className="px-4 py-3">{usuario.nombre}</td>
                            <td className="px-4 py-3">{usuario.email}</td>
                            <td className="px-4 py-3">
                              <Badge variant={usuario.rol === 'admin' ? 'default' : 'secondary'}>
                                {usuario.rol === 'admin' ? 'Administrador' : 'Vendedor'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={usuario.activo ? 'default' : 'outline'}>
                                {usuario.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del sistema</CardTitle>
                <CardDescription>
                  Ajustes generales de la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notificaciones</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifyLeads" className="flex items-center space-x-2">
                        <span>Notificaciones de nuevos leads</span>
                      </Label>
                      <Switch id="notifyLeads" checked={true} />
                    </div>
                    <p className="text-sm text-slate-500">
                      Recibe notificaciones cuando se registren nuevos leads en el sistema
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifyVentas" className="flex items-center space-x-2">
                        <span>Notificaciones de ventas</span>
                      </Label>
                      <Switch id="notifyVentas" checked={true} />
                    </div>
                    <p className="text-sm text-slate-500">
                      Recibe notificaciones cuando se realice una nueva venta
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Seguridad</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="twoFactor" className="flex items-center space-x-2">
                        <span>Autenticación de dos factores</span>
                      </Label>
                      <Switch id="twoFactor" />
                    </div>
                    <p className="text-sm text-slate-500">
                      Añade una capa extra de seguridad con autenticación de dos factores
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sessionTimeout" className="flex items-center space-x-2">
                        <span>Tiempo de sesión</span>
                      </Label>
                      <Select defaultValue="60">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar tiempo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="120">2 horas</SelectItem>
                          <SelectItem value="240">4 horas</SelectItem>
                          <SelectItem value="480">8 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-slate-500">
                      Tiempo de inactividad antes de cerrar la sesión automáticamente
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <h3 className="text-lg font-medium">Mantenimiento</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="backup" className="flex items-center space-x-2">
                        <span>Backups automáticos</span>
                      </Label>
                      <Switch id="backup" checked={true} />
                    </div>
                    <p className="text-sm text-slate-500">
                      Realiza copias de seguridad automáticas de la base de datos
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Restablecer todas las configuraciones
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ConfiguracionPage;
