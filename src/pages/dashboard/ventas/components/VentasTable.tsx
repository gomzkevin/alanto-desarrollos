
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Search, Eye, CreditCard } from "lucide-react";
import { useVentas, VentasFilter } from "@/hooks/useVentas";
import { formatCurrency } from "@/lib/utils";

const VentasTable = () => {
  const [filters, setFilters] = useState<VentasFilter>({
    estado: 'todos'
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const { ventas, isLoading } = useVentas(filters);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, busqueda: searchQuery }));
  };
  
  const handleEstadoChange = (value: string) => {
    setFilters(prev => ({ ...prev, estado: value }));
  };
  
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <Badge variant="success">Completada</Badge>;
      case 'en_proceso':
        return <Badge variant="warning">En proceso</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Lista de ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Buscar por desarrollo o unidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex space-x-2">
              <Select 
                defaultValue="todos"
                onValueChange={handleEstadoChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Cargando ventas...</p>
            </div>
          ) : ventas.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No se encontraron ventas con los filtros actuales</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Desarrollo / Unidad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Precio Total</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {venta.unidad?.prototipo?.desarrollo?.nombre || 'Desarrollo'} 
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {venta.unidad?.prototipo?.nombre || 'Prototipo'} - Unidad {venta.unidad?.numero || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {venta.es_fraccional ? 'Fraccional' : 'Individual'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(venta.precio_total)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={venta.progreso || 0} className="h-2" />
                          <p className="text-xs text-right">{venta.progreso || 0}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEstadoBadge(venta.estado)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/ventas/${venta.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/dashboard/ventas/${venta.id}?tab=pagos`}>
                              <CreditCard className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasTable;
