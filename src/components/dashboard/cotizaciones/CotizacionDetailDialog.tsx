import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExtendedCotizacion } from '@/hooks/useCotizaciones';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { generateAmortizationTable } from '@/utils/quotationPDF';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Calendar, 
  DollarSign, 
  User, 
  CreditCard, 
  Layers, 
  Check, 
  Clock, 
  FileText,
  Banknote,
  Bath,
  Dumbbell,
  Flame,
  ParkingSquare,
  Utensils,
  Wifi,
  Heart,
  Baby,
  Lock,
  Car,
  Trees,
  Waves,
  Coffee,
  GlassWater
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import EditCotizacionButton from '@/components/dashboard/EditCotizacionButton';

interface CotizacionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotizacion: ExtendedCotizacion | null;
}

const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const getAmenityIcon = (amenityId: string) => {
  const amenityMap: Record<string, { icon: React.ReactNode, label: string }> = {
    "pool": { icon: <Waves className="h-3.5 w-3.5 mr-1" />, label: "Alberca" },
    "gym": { icon: <Dumbbell className="h-3.5 w-3.5 mr-1" />, label: "Gimnasio" },
    "spa": { icon: <Bath className="h-3.5 w-3.5 mr-1" />, label: "Spa" },
    "bbq": { icon: <Flame className="h-3.5 w-3.5 mr-1" />, label: "Área de BBQ" },
    "playground": { icon: <Baby className="h-3.5 w-3.5 mr-1" />, label: "Área infantil" },
    "security": { icon: <Lock className="h-3.5 w-3.5 mr-1" />, label: "Seguridad 24/7" },
    "parking": { icon: <ParkingSquare className="h-3.5 w-3.5 mr-1" />, label: "Estacionamiento" },
    "garden": { icon: <Trees className="h-3.5 w-3.5 mr-1" />, label: "Jardín" },
    "beach": { icon: <Waves className="h-3.5 w-3.5 mr-1" />, label: "Playa" },
    "restaurant": { icon: <Utensils className="h-3.5 w-3.5 mr-1" />, label: "Restaurante" },
    "bar": { icon: <GlassWater className="h-3.5 w-3.5 mr-1" />, label: "Bar" },
    "wifi": { icon: <Wifi className="h-3.5 w-3.5 mr-1" />, label: "WiFi" }
  };

  return amenityMap[amenityId] || { icon: <Check className="h-3.5 w-3.5 mr-1" />, label: amenityId };
};

const CotizacionDetailDialog = ({ 
  open, 
  onOpenChange, 
  cotizacion 
}: CotizacionDetailDialogProps) => {
  const [desarrolloImageUrl, setDesarrolloImageUrl] = useState<string | null>(null);
  const [prototipoImageUrl, setPrototipoImageUrl] = useState<string | null>(null);
  const [amenidades, setAmenidades] = useState<string[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<Record<string, any> | null>(null);
  const [amortizationTable, setAmortizationTable] = useState<any[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      if (!cotizacion) return;

      if (cotizacion.desarrollo_id) {
        try {
          const { data: imageData } = await supabase
            .from('desarrollo_imagenes')
            .select('url')
            .eq('desarrollo_id', cotizacion.desarrollo_id)
            .eq('es_principal', true)
            .limit(1)
            .single();

          if (imageData) {
            setDesarrolloImageUrl(imageData.url);
          } else {
            const { data: anyImage } = await supabase
              .from('desarrollo_imagenes')
              .select('url')
              .eq('desarrollo_id', cotizacion.desarrollo_id)
              .limit(1)
              .single();
            
            if (anyImage) {
              setDesarrolloImageUrl(anyImage.url);
            }
          }
        } catch (error) {
          console.error('Error fetching desarrollo image:', error);
        }
      }

      if (cotizacion.prototipo_id) {
        try {
          const { data: prototipo } = await supabase
            .from('prototipos')
            .select('imagen_url')
            .eq('id', cotizacion.prototipo_id)
            .single();

          if (prototipo && prototipo.imagen_url) {
            setPrototipoImageUrl(prototipo.imagen_url);
          }
        } catch (error) {
          console.error('Error fetching prototipo image:', error);
        }
      }
    };

    const fetchAmenidades = async () => {
      if (!cotizacion?.desarrollo_id) return;
      
      try {
        const { data, error } = await supabase
          .from('desarrollos')
          .select('amenidades')
          .eq('id', cotizacion.desarrollo_id)
          .single();
        
        if (error || !data || !data.amenidades) {
          setAmenidades([]);
          return;
        }
        
        if (Array.isArray(data.amenidades)) {
          setAmenidades(data.amenidades.map(item => String(item)));
        } else if (typeof data.amenidades === 'object') {
          setAmenidades(Object.values(data.amenidades).map(value => String(value)));
        } else if (typeof data.amenidades === 'string') {
          try {
            const parsed = JSON.parse(data.amenidades);
            if (Array.isArray(parsed)) {
              setAmenidades(parsed.map(item => String(item)));
            } else {
              setAmenidades([String(data.amenidades)]);
            }
          } catch (e) {
            setAmenidades([String(data.amenidades)]);
          }
        } else {
          setAmenidades([]);
        }
      } catch (error) {
        console.error('Error fetching amenidades:', error);
        setAmenidades([]);
      }
    };

    const fetchCaracteristicas = async () => {
      if (!cotizacion?.prototipo_id) return;
      
      try {
        const { data, error } = await supabase
          .from('prototipos')
          .select('caracteristicas, habitaciones, baños, superficie, estacionamientos')
          .eq('id', cotizacion.prototipo_id)
          .single();
        
        if (error || !data) {
          setCaracteristicas(null);
          return;
        }
        
        setCaracteristicas(data);
      } catch (error) {
        console.error('Error fetching prototipo caracteristicas:', error);
        setCaracteristicas(null);
      }
    };

    const generateAmortizationData = () => {
      if (!cotizacion || !cotizacion.prototipo?.precio) return;

      const startDate = cotizacion.fecha_inicio_pagos 
        ? new Date(cotizacion.fecha_inicio_pagos)
        : new Date();

      const finiquitoDate = cotizacion.fecha_finiquito
        ? new Date(cotizacion.fecha_finiquito)
        : undefined;

      const table = generateAmortizationTable(
        cotizacion.prototipo.precio,
        cotizacion.monto_anticipo,
        cotizacion.monto_finiquito || 0,
        cotizacion.numero_pagos,
        startDate,
        cotizacion.usar_finiquito,
        finiquitoDate
      );

      setAmortizationTable(table);
    };

    if (cotizacion) {
      fetchImages();
      fetchAmenidades();
      fetchCaracteristicas();
      generateAmortizationData();
    }
  }, [cotizacion]);

  if (!cotizacion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Cotización {cotizacion.id.substring(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Generada el {cotizacion.created_at
              ? format(new Date(cotizacion.created_at), "d 'de' MMMM 'de' yyyy", { locale: es })
              : 'N/A'}
          </DialogDescription>
        </DialogHeader>
        
        <div id="cotizacion-detail-content" className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Cliente info */}
          <Card className="lg:col-span-1">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {cotizacion.lead ? (
                <div className="space-y-2">
                  <p className="font-semibold text-lg">{cotizacion.lead.nombre}</p>
                  {cotizacion.lead.email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">Email:</span> {cotizacion.lead.email}
                    </p>
                  )}
                  {cotizacion.lead.telefono && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">Teléfono:</span> {cotizacion.lead.telefono}
                    </p>
                  )}
                  {cotizacion.lead.origen && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="font-medium">Origen:</span> {cotizacion.lead.origen}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay información del cliente</p>
              )}
            </CardContent>
          </Card>

          {/* Desarrollo info */}
          <Card className="lg:col-span-2">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Información del Desarrollo y Prototipo
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Desarrollo info */}
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Desarrollo</h4>
                  {cotizacion.desarrollo ? (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{cotizacion.desarrollo.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {cotizacion.desarrollo.ubicacion}
                      </p>
                      {desarrolloImageUrl && (
                        <div className="mt-3 relative aspect-video w-full overflow-hidden rounded-md">
                          <img 
                            src={desarrolloImageUrl} 
                            alt={cotizacion.desarrollo.nombre} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay información del desarrollo</p>
                  )}
                </div>
                
                {/* Prototipo info */}
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Prototipo</h4>
                  {cotizacion.prototipo ? (
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{cotizacion.prototipo.nombre}</p>
                      <p className="text-lg font-bold text-primary">
                        {formatter.format(cotizacion.prototipo.precio)}
                      </p>
                      
                      {/* Characteristics */}
                      {caracteristicas && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {caracteristicas.habitaciones && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <span>{caracteristicas.habitaciones} Habitaciones</span>
                            </Badge>
                          )}
                          {caracteristicas.baños && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <span>{caracteristicas.baños} Baños</span>
                            </Badge>
                          )}
                          {caracteristicas.superficie && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <span>{caracteristicas.superficie} m²</span>
                            </Badge>
                          )}
                          {caracteristicas.estacionamientos && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <span>{caracteristicas.estacionamientos} Estacionamientos</span>
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {prototipoImageUrl && (
                        <div className="mt-3 relative aspect-video w-full overflow-hidden rounded-md">
                          <img 
                            src={prototipoImageUrl} 
                            alt={cotizacion.prototipo.nombre} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay información del prototipo</p>
                  )}
                </div>
              </div>
              
              {/* Amenidades */}
              {amenidades.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Amenidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {amenidades.map((amenidadId, index) => {
                      const { icon, label } = getAmenityIcon(amenidadId);
                      return (
                        <Badge key={index} variant="amenity" className="flex items-center py-1">
                          {icon}
                          <span>{label}</span>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Detalles de la cotización */}
          <Card className="lg:col-span-3">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Detalles del Plan de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center justify-center">
                  <CreditCard className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Anticipo</p>
                  <p className="text-xl font-bold">{formatter.format(cotizacion.monto_anticipo)}</p>
                </div>
                
                <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center justify-center">
                  <Layers className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Mensualidades</p>
                  <p className="text-xl font-bold">{cotizacion.numero_pagos}</p>
                </div>
                
                {cotizacion.usar_finiquito && cotizacion.monto_finiquito ? (
                  <div className="bg-primary/5 rounded-lg p-4 flex flex-col items-center justify-center">
                    <Banknote className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Finiquito</p>
                    <p className="text-xl font-bold">{formatter.format(cotizacion.monto_finiquito)}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground">Sin Finiquito</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Fechas Importantes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                      <p className="font-medium">
                        {cotizacion.fecha_inicio_pagos
                          ? format(new Date(cotizacion.fecha_inicio_pagos), "d MMM yyyy", { locale: es })
                          : "No especificada"}
                      </p>
                    </div>
                  </div>
                  
                  {cotizacion.usar_finiquito && cotizacion.fecha_finiquito && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha de Finiquito</p>
                        <p className="font-medium">
                          {format(new Date(cotizacion.fecha_finiquito), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Table of amortization */}
              {amortizationTable.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Tabla de Amortización</h4>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-primary/5">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No. Pago
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Saldo Restante
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {amortizationTable.map((row, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {row.paymentNumber}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {format(row.date, "d MMM yyyy", { locale: es })}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {row.description}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                              {formatter.format(row.amount)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {formatter.format(row.remainingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {cotizacion.notas && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Notas</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm">{cotizacion.notas}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex justify-between items-center gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <div className="flex items-center gap-2">
            <EditCotizacionButton 
              cotizacionId={cotizacion.id} 
              onSuccess={() => onOpenChange(false)}
            />
            <ExportPDFButton
              variant="default"
              cotizacionId={cotizacion.id}
              buttonText="Exportar PDF"
              resourceName="cotización"
              elementId="cotizacion-detail-content"
              fileName={`Cotizacion_${cotizacion.lead?.nombre || 'Cliente'}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}`}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CotizacionDetailDialog;
