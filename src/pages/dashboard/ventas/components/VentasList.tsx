
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, Eye, BarChart, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { VentaBasica } from '@/hooks/useVentas';
import EmptyState from './EmptyState';

interface VentasListProps {
  ventas: VentaBasica[];
}

const VentasList = ({ ventas }: VentasListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'fecha' | 'progreso' | 'precio'>('fecha');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filtrar por término de búsqueda
  const filteredVentas = ventas.filter(venta => {
    const searchString = searchTerm.toLowerCase();
    
    // Información de la unidad
    const unidadNumero = venta.unidad?.numero?.toLowerCase() || '';
    const prototipoNombre = venta.unidad?.prototipo?.nombre?.toLowerCase() || '';
    const desarrolloNombre = venta.unidad?.prototipo?.desarrollo?.nombre?.toLowerCase() || '';
    
    // Información de compradores
    const compradorNombres = venta.compradores?.map(c => 
      c.comprador?.nombre?.toLowerCase() || ''
    ).join(' ') || '';
    
    return unidadNumero.includes(searchString) || 
           prototipoNombre.includes(searchString) || 
           desarrolloNombre.includes(searchString) ||
           compradorNombres.includes(searchString);
  });

  // Ordenar las ventas
  const sortedVentas = [...filteredVentas].sort((a, b) => {
    if (sortField === 'fecha') {
      const dateA = new Date(a.fecha_actualizacion).getTime();
      const dateB = new Date(b.fecha_actualizacion).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } 
    
    if (sortField === 'progreso') {
      const progressA = a.progreso || 0;
      const progressB = b.progreso || 0;
      return sortDirection === 'asc' ? progressA - progressB : progressB - progressA;
    }
    
    // sortField === 'precio'
    const priceA = a.precio_total || 0;
    const priceB = b.precio_total || 0;
    return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
  });

  const handleSort = (field: 'fecha' | 'progreso' | 'precio') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewVenta = (ventaId: string) => {
    navigate(`/dashboard/ventas/${ventaId}`);
  };

  // Renderizar estado de venta
  const renderEstado = (estado: string) => {
    switch (estado) {
      case 'en_proceso':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En Proceso</Badge>;
      case 'completada':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  // Si no hay ventas, mostrar estado vacío
  if (ventas.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por unidad, desarrollo o comprador..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredVentas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron ventas con ese criterio de búsqueda.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidad</TableHead>
                <TableHead>Desarrollo / Prototipo</TableHead>
                <TableHead>Compradores</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('precio')}
                >
                  <div className="flex items-center">
                    Precio Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('progreso')}
                >
                  <div className="flex items-center">
                    Progreso
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('fecha')}
                >
                  <div className="flex items-center">
                    Actualización
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVentas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell className="font-medium">
                    {venta.unidad?.numero || 'N/A'}
                    {venta.es_fraccional && (
                      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-500 border-blue-100">
                        Fraccional
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{venta.unidad?.prototipo?.desarrollo?.nombre || 'N/A'}</span>
                      <span className="text-sm text-muted-foreground">{venta.unidad?.prototipo?.nombre || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {venta.compradores && venta.compradores.length > 0 ? (
                      <div className="space-y-1">
                        {venta.compradores.map((comprador) => (
                          <div key={comprador.id} className="text-sm">
                            {comprador.comprador?.nombre || 'Sin nombre'}
                            {venta.es_fraccional && (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({comprador.porcentaje_propiedad}%)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin compradores</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(venta.precio_total)}</TableCell>
                  <TableCell>{renderEstado(venta.estado)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress value={venta.progreso || 0} className="h-2" />
                      <span className="text-xs text-muted-foreground">{Math.round(venta.progreso || 0)}% completado</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(venta.fecha_actualizacion).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVenta(venta.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VentasList;
